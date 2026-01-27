/**
 * AI Chat Action - Main entry point for the AI assistant
 * Uses Google Gemini with function calling
 */
import { v } from "convex/values";
import { action, internalQuery, internalMutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { tools, MUTATIVE_TOOLS, UI_TOOLS, type AIAction } from "./tools";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Tu es l'Assistant IA du Consulat du Gabon. Tu aides les citoyens gabonais et les usagers du consulat avec leurs démarches administratives.

INSTRUCTIONS:
- Réponds toujours en français
- Sois poli, professionnel et bienveillant
- Utilise les outils disponibles pour accéder aux informations de l'utilisateur
- Ne jamais inventer d'informations - utilise les outils pour récupérer les vraies données
- Pour les actions qui modifient des données, explique ce que tu vas faire et demande confirmation
- Guide l'utilisateur étape par étape dans ses démarches

SERVICES CONSULAIRES DISPONIBLES:
- Passeports (nouveau, renouvellement)
- Cartes consulaires
- État civil (actes de naissance, mariage, décès)
- Légalisation de documents
- Visas
- Inscription consulaire

PAGES DE L'APPLICATION:
- /my-space : Espace personnel
- /my-space/profile : Mon profil
- /my-space/requests : Mes demandes
- /my-space/documents : Mes documents
- /my-space/appointments : Mes rendez-vous
- /services : Catalogue des services
- /news : Actualités`;

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

    // Get user info for context
    const user = await ctx.runQuery(api.functions.users.getMe);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    contextPrompt += `\n\nUTILISATEUR ACTUEL:
- Nom: ${user.firstName || ""} ${user.lastName || ""}
- Email: ${user.email}`;

    if (currentPage) {
      contextPrompt += `\n- Page actuelle: ${currentPage}`;
    }

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

    // Prepare tool declarations for Gemini
    const functionDeclarations = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as Record<string, unknown>,
    }));

    // Call Gemini with tools
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
      const functionResponses = toolResults.map((tr) => ({
        functionResponse: {
          name: tr.name,
          response: tr.result,
        },
      }));

      // Continue the conversation with tool results
      const followUpContents = [
        ...contents,
        { role: "model", parts: candidate.content.parts },
        { role: "function", parts: functionResponses },
      ];

      const followUp = await ai.models.generateContent({
        model: "gemini-2.0-flash",
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

    // Fallback message
    if (!responseText) {
      responseText = "Je suis désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";
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
