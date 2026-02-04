/**
 * AI Chat Action - Main entry point for the AI assistant
 * Uses Google Gemini with function calling
 */
import { v } from "convex/values";
import { action, internalQuery, internalMutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { tools, MUTATIVE_TOOLS, UI_TOOLS, type AIAction } from "./tools";
import { rateLimiter } from "./rateLimiter";
import { generateRoutesPromptSection } from "./routes-manifest";

// Use gemini-2.5-flash for all AI requests
const AI_MODEL = "gemini-2.5-flash";

// System prompt for the AI assistant - persona and behavior only
const SYSTEM_PROMPT = `Tu es l'Assistant IA du Consulat du Gabon en France. Tu aides les citoyens gabonais et les usagers du consulat avec leurs démarches administratives.

COMPORTEMENT:
- Réponds dans la langue de l'utilisateur
- Sois poli, professionnel et bienveillant
- Utilise TOUJOURS les outils mis à ta disposition pour accéder aux données réelles
- Ne jamais inventer d'informations - appelle les fonctions pour récupérer les vraies données
- Pour naviguer l'utilisateur vers une page, utilise la fonction navigateTo
- Quand l'utilisateur te donne des informations personnelles (prénom, nom, date de naissance, etc.), utilise fillForm pour pré-remplir le formulaire avec ces données
- Guide l'utilisateur étape par étape dans ses démarches

UTILISATION DE FILLFORM:
Quand l'utilisateur fournit des informations comme "je m'appelle Jean Dupont, né le 15/03/1985":
1. Utilise fillForm avec formId="profile" et les champs extraits (firstName, lastName, birthDate en YYYY-MM-DD)
2. Mets navigateFirst=true pour rediriger vers le formulaire
3. Le formulaire sera automatiquement pré-rempli pour l'utilisateur`;

// Message type from conversations schema
type ConversationMessage = {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: Array<{ name: string; args: unknown; result?: unknown }>;
  timestamp: number;
};

// Return type for chat action
type ChatResponse = {
  conversationId: Id<"conversations">;
  message: string;
  actions: AIAction[];
};

/**
 * Main chat action
 */
export const chat = action({
  args: {
    conversationId: v.optional(v.id("conversations")),
    message: v.string(),
    currentPage: v.optional(v.string()),
  },
  handler: async (ctx, { conversationId, message, currentPage }): Promise<ChatResponse> => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("NOT_AUTHENTICATED");
    }

    // Rate limiting: 20 messages/minute per user
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "aiChat", { 
      key: identity.subject 
    });
    if (!ok) {
      const waitSeconds = Math.ceil((retryAfter ?? 0) / 1000);
      throw new Error(`RATE_LIMITED:Vous envoyez trop de messages. Veuillez attendre ${waitSeconds} secondes.`);
    }

    // Get user info for context
    const user = await ctx.runQuery(api.functions.users.getMe);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    
    // Add user info
    contextPrompt += `\n\nUTILISATEUR ACTUEL:
- Nom: ${user.firstName || ""} ${user.lastName || ""}
- Email: ${user.email}`;

    // Add current page
    if (currentPage) {
      contextPrompt += `\n- Page actuelle: ${currentPage}`;
    }

    // Add available routes based on user role
    const userRole = user.role as "citizen" | "staff" | "admin" | "super_admin" | undefined;
    contextPrompt += generateRoutesPromptSection(userRole ?? "citizen");

    // Get conversation history if exists
    let history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (conversationId) {
      const conversation = await ctx.runQuery(
        internal.ai.chat.getConversation,
        { conversationId }
      );
      if (conversation) {
        history = conversation.messages
          .filter((m: ConversationMessage) => m.role !== "tool")
          .map((m: ConversationMessage) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
      }
    }

    // Initialize Gemini
    const { GoogleGenAI } = await import("@google/genai");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    const ai = new GoogleGenAI({ apiKey });

    // Build the request contents with system instruction as first message
    const contents = [
      { role: "user", parts: [{ text: `[INSTRUCTIONS SYSTÈME] ${contextPrompt}` }] },
      { role: "model", parts: [{ text: "Compris, je suis l'Assistant IA du Consulat du Gabon. Comment puis-je vous aider ?" }] },
      ...history,
      { role: "user", parts: [{ text: message }] },
    ];

    // Filter tools based on user permissions
    // Authenticated users get read-only + mutative tools
    const userTools = tools.filter(t => {
      const allowedTools = [
        // Read-only
        "getProfile", "getServices", "getRequests", "getAppointments",
        // UI actions
        "navigateTo", "fillForm",
        // Mutative (require confirmation)
        "createRequest", "cancelRequest",
      ];
      return allowedTools.includes(t.name);
    });

    // Prepare tool declarations for Gemini
    const functionDeclarations = userTools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as Record<string, unknown>,
    }));

    // Call Gemini with tools
    console.log(`[AI] Using model: ${AI_MODEL}`);
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: contents as Parameters<typeof ai.models.generateContent>[0]["contents"],
      config: {
        tools: [{ functionDeclarations }],
      },
    });

    // Process the response
    const candidate = response.candidates?.[0];
    
    if (!candidate?.content?.parts) {
      throw new Error("No response from Gemini");
    }

    const actions: AIAction[] = [];
    let responseText = "";
    const toolResults: Array<{ name: string; result: unknown }> = [];

    // Process each part of the response
    for (const part of candidate.content.parts) {
      if ("text" in part && part.text) {
        responseText += part.text;
      }

      if ("functionCall" in part && part.functionCall) {
        const name = part.functionCall.name;
        const args = (part.functionCall.args || {}) as Record<string, unknown>;

        if (!name) continue;

        // Check if it's a UI action (don't execute, send to frontend)
        if (UI_TOOLS.includes(name as typeof UI_TOOLS[number])) {
          actions.push({
            type: name,
            args: args,
            requiresConfirmation: false,
            reason: args.reason as string,
          });
        }
        // Check if it requires confirmation
        else if (MUTATIVE_TOOLS.includes(name as typeof MUTATIVE_TOOLS[number])) {
          actions.push({
            type: name,
            args: args,
            requiresConfirmation: true,
          });
        }
        // Execute read-only tools immediately
        else {
          try {
            let toolResult: unknown;
            
            switch (name) {
              case "getProfile":
                toolResult = await ctx.runQuery(api.functions.profiles.getMine);
                break;
              case "getServices":
                toolResult = await ctx.runQuery(api.functions.services.listCatalog, {});
                break;
              case "getRequests":
                toolResult = await ctx.runQuery(api.functions.requests.listMine, {});
                break;
              case "getAppointments":
                toolResult = await ctx.runQuery(api.functions.appointments.listByUser, {});
                break;
              case "getNotifications":
                toolResult = await ctx.runQuery(api.functions.notifications.list, {
                  limit: (args as { limit?: number }).limit ?? 10,
                });
                break;
              case "getUnreadNotificationCount":
                toolResult = await ctx.runQuery(api.functions.notifications.getUnreadCount);
                break;
              case "getUserContext": {
                // Combine profile, consular card, active request, and notification count
                const [profile, consularCard, activeRequest, unreadCount] = await Promise.all([
                  ctx.runQuery(api.functions.profiles.getMine),
                  ctx.runQuery(api.functions.consularCard.getMyCard),
                  ctx.runQuery(api.functions.requests.getLatestActive),
                  ctx.runQuery(api.functions.notifications.getUnreadCount),
                ]);
                toolResult = {
                  profile,
                  consularCard,
                  activeRequest,
                  unreadNotifications: unreadCount,
                };
                break;
              }
              case "getServicesByCountry": {
                const typedArgs = args as { country?: string; category?: string };
                // If no country provided, get user's country of residence first
                let country = typedArgs.country;
                if (!country) {
                  const profile = await ctx.runQuery(api.functions.profiles.getMine);
                  country = profile?.countryOfResidence ?? "FR";
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                toolResult = await ctx.runQuery(api.functions.services.listByCountry, {
                  country,
                  category: typedArgs.category as any,
                });
                break;
              }
              case "getOrganizationInfo": {
                const typedArgs = args as { orgId?: string };
                if (typedArgs.orgId) {
                  toolResult = await ctx.runQuery(api.functions.orgs.getById, {
                    orgId: typedArgs.orgId as Id<"orgs">,
                  });
                } else {
                  // Get user's profile to find their country, then get the org for that country
                  const profile = await ctx.runQuery(api.functions.profiles.getMine);
                  const country = profile?.countryOfResidence ?? "FR";
                  const orgs = await ctx.runQuery(api.functions.orgs.listByJurisdiction, {
                    residenceCountry: country,
                  });
                  toolResult = orgs?.[0] ?? null;
                }
                break;
              }
              case "getLatestNews":
                toolResult = await ctx.runQuery(api.functions.posts.getLatest, {
                  limit: (args as { limit?: number }).limit ?? 5,
                });
                break;
              case "getMyAssociations":
                toolResult = await ctx.runQuery(api.functions.associations.getMine);
                break;
              case "getMyConsularCard":
                toolResult = await ctx.runQuery(api.functions.consularCard.getMyCard);
                break;
              case "getRequestDetails": {
                const typedArgs = args as { requestId: string };
                toolResult = await ctx.runQuery(api.functions.requests.getById, {
                  requestId: typedArgs.requestId as Id<"requests">,
                });
                break;
              }
              default:
                toolResult = { error: `Unknown tool: ${name}` };
            }
            
            toolResults.push({ name, result: toolResult });
          } catch (error) {
            toolResults.push({
              name,
              result: { error: (error as Error).message },
            });
          }
        }
      }
    }

    // If we executed tools, we need to continue the conversation with results
    if (toolResults.length > 0 && !responseText) {
      // Each function response should be a separate part
      const functionResponseParts = toolResults.map((tr) => ({
        functionResponse: {
          name: tr.name,
          response: { output: tr.result },
        },
      }));

      // Continue the conversation with tool results
      const followUpContents = [
        ...contents,
        { role: "model", parts: candidate.content.parts },
        { role: "user", parts: functionResponseParts },
      ];

      const followUp = await ai.models.generateContent({
        model: AI_MODEL,
        contents: followUpContents as Parameters<typeof ai.models.generateContent>[0]["contents"],
        config: {
          systemInstruction: contextPrompt,
        },
      });

      const followUpCandidate = followUp.candidates?.[0];
      if (followUpCandidate?.content?.parts) {
        for (const part of followUpCandidate.content.parts) {
          if ("text" in part && part.text) {
            responseText = part.text;
          }
        }
      }
    }

    // Fallback message - but if actions are returned, provide appropriate context
    if (!responseText) {
      if (actions.length > 0) {
        // Actions were returned, so the AI did respond - no error
        const uiActions = actions.filter(a => !a.requiresConfirmation);
        const confirmableActions = actions.filter(a => a.requiresConfirmation);
        
        if (uiActions.length > 0 && confirmableActions.length === 0) {
          // Only UI actions - will be executed automatically
          responseText = "C'est parti !";
        } else if (confirmableActions.length > 0) {
          responseText = "Je peux effectuer cette action pour vous. Veuillez confirmer ci-dessous.";
        }
      } else {
        responseText = "Je suis désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";
      }
    }

    // Save conversation to database
    const newConversationId = await ctx.runMutation(
      internal.ai.chat.saveMessage,
      {
        conversationId,
        userId: user._id,
        userMessage: message,
        assistantMessage: responseText,
        toolCalls: toolResults.map((tr) => ({
          name: tr.name,
          args: {},
          result: tr.result,
        })),
      }
    );

    return {
      conversationId: newConversationId,
      message: responseText,
      actions,
    };
  },
});

/**
 * Internal query to get conversation history
 */
export const getConversation = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db.get(conversationId);
  },
});

/**
 * Internal mutation to save messages
 */
export const saveMessage = internalMutation({
  args: {
    conversationId: v.optional(v.id("conversations")),
    userId: v.id("users"),
    userMessage: v.string(),
    assistantMessage: v.string(),
    toolCalls: v.array(
      v.object({
        name: v.string(),
        args: v.any(),
        result: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args): Promise<Id<"conversations">> => {
    const now = Date.now();

    if (args.conversationId) {
      // Update existing conversation
      const conversation = await ctx.db.get(args.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      await ctx.db.patch(args.conversationId, {
        messages: [
          ...conversation.messages,
          {
            role: "user" as const,
            content: args.userMessage,
            timestamp: now,
          },
          {
            role: "assistant" as const,
            content: args.assistantMessage,
            toolCalls: args.toolCalls.length > 0 ? args.toolCalls : undefined,
            timestamp: now,
          },
        ],
        updatedAt: now,
      });

      return args.conversationId;
    } else {
      // Create new conversation
      return await ctx.db.insert("conversations", {
        userId: args.userId,
        messages: [
          {
            role: "user" as const,
            content: args.userMessage,
            timestamp: now,
          },
          {
            role: "assistant" as const,
            content: args.assistantMessage,
            toolCalls: args.toolCalls.length > 0 ? args.toolCalls : undefined,
            timestamp: now,
          },
        ],
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Query to list user's conversations
 */
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("conversations")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .order("desc")
      .take(20);
  },
});

/**
 * Execute a confirmed action (mutative tool)
 * Called by frontend after user confirms the action
 */
export const executeAction = action({
  args: {
    actionType: v.string(),
    actionArgs: v.any(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, { actionType, actionArgs, conversationId }) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("NOT_AUTHENTICATED");
    }

    // Validate that this is an allowed mutative action
    if (!MUTATIVE_TOOLS.includes(actionType as typeof MUTATIVE_TOOLS[number])) {
      throw new Error(`Action '${actionType}' is not allowed`);
    }

    let result: { success: boolean; data?: unknown; error?: string };

    try {
      switch (actionType) {
        case "createRequest": {
          const serviceSlug = actionArgs.serviceSlug as string;
          const submitNow = actionArgs.submitNow as boolean | undefined;
          
          // Get user's profile to determine their registered org
          const profile = await ctx.runQuery(api.functions.profiles.getMine);
          
          // Get consular registrations for this profile
          const registrations = await ctx.runQuery(api.functions.consularRegistrations.listByProfile);
          const activeRegistration = registrations?.[0];
          
          if (!profile || !activeRegistration) {
            throw new Error("Vous devez être inscrit à un consulat pour créer une demande.");
          }
          
          const orgId = activeRegistration.orgId;
          
          // Find the service by slug
          const service = await ctx.runQuery(api.functions.services.getBySlug, {
            slug: serviceSlug,
          });
          
          if (!service) {
            throw new Error(`Service '${serviceSlug}' introuvable`);
          }
          
          // Find the org service (service activated for user's org)
          const orgService = await ctx.runQuery(api.functions.services.getByOrgAndService, {
            orgId: orgId,
            serviceId: service._id,
          });
          
          if (!orgService) {
            throw new Error(`Le service '${serviceSlug}' n'est pas disponible dans votre consulat`);
          }
          
          // Create the request
          const requestId = await ctx.runMutation(api.functions.requests.create, {
            orgServiceId: orgService._id,
            submitNow: submitNow ?? false,
          });
          
          result = {
            success: true,
            data: { requestId, message: submitNow ? "Demande créée et soumise" : "Brouillon créé" },
          };
          break;
        }
        
        case "cancelRequest": {
          const requestId = actionArgs.requestId as string;
          
          await ctx.runMutation(api.functions.requests.cancel, {
            requestId: requestId as Id<"requests">,
          });
          
          result = {
            success: true,
            data: { message: "Demande annulée" },
          };
          break;
        }
        
        default:
          throw new Error(`Unknown action: ${actionType}`);
      }
    } catch (error) {
      result = {
        success: false,
        error: (error as Error).message,
      };
    }

    // If we have a conversationId, log the action execution
    if (conversationId) {
      await ctx.runMutation(internal.ai.chat.logActionExecution, {
        conversationId,
        actionType,
        actionArgs,
        result,
      });
    }

    return result;
  },
});

/**
 * Internal mutation to log action execution in conversation
 */
export const logActionExecution = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    actionType: v.string(),
    actionArgs: v.any(),
    result: v.object({
      success: v.boolean(),
      data: v.optional(v.any()),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    const now = Date.now();
    const toolMessage = {
      role: "tool" as const,
      content: args.result.success
        ? `Action ${args.actionType} exécutée: ${JSON.stringify(args.result.data)}`
        : `Erreur ${args.actionType}: ${args.result.error}`,
      toolCalls: [
        {
          name: args.actionType,
          args: args.actionArgs,
          result: args.result,
        },
      ],
      timestamp: now,
    };

    await ctx.db.patch(args.conversationId, {
      messages: [...conversation.messages, toolMessage],
      updatedAt: now,
    });
  },
});
