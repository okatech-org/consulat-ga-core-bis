import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { internal } from "../_generated/api";

/**
 * AI Service for analyzing requests using Gemini
 */

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Analysis prompt template
 */
const getAnalysisPrompt = (data: {
  serviceName: string;
  requiredDocuments: string[];
  providedDocuments: string[];
  formData: Record<string, unknown>;
}) => `Tu es un assistant consulaire expert. Analyse cette demande de service consulaire.

## Service demandé
${data.serviceName}

## Documents requis par le service
${data.requiredDocuments.length > 0 ? data.requiredDocuments.map(d => `- ${d}`).join('\n') : 'Aucun document requis spécifié'}

## Documents fournis par le demandeur
${data.providedDocuments.length > 0 ? data.providedDocuments.map(d => `- ${d}`).join('\n') : 'Aucun document fourni'}

## Données du formulaire
\`\`\`json
${JSON.stringify(data.formData, null, 2)}
\`\`\`

## Instructions d'analyse
Analyse cette demande et vérifie :
1. Tous les documents requis sont-ils présents ?
2. Les informations du formulaire sont-elles cohérentes et complètes ?
3. Y a-t-il des anomalies ou incohérences détectées ?

## Format de réponse (JSON uniquement)
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour :
{
  "status": "complete" | "incomplete" | "review_needed",
  "missingDocuments": ["liste des documents manquants"],
  "issues": ["liste des problèmes détectés"],
  "summary": "résumé concis de l'analyse en français",
  "confidence": 0-100,
  "suggestedAction": "upload_document" | "complete_info" | "confirm_info" | null,
  "actionMessage": "message à afficher au citoyen si action requise"
}`;

interface AnalysisResult {
  status: "complete" | "incomplete" | "review_needed";
  missingDocuments: string[];
  issues: string[];
  summary: string;
  confidence: number;
  suggestedAction: "upload_document" | "complete_info" | "confirm_info" | null;
  actionMessage: string | null;
}

/**
 * Analyze a request using Gemini AI
 * Triggered automatically when a request is submitted
 */
export const analyzeRequest = internalAction({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args): Promise<void> => {
    // Fetch request data
    const request = await ctx.runQuery(internal.functions.ai.getRequestData, {
      requestId: args.requestId,
    });

    if (!request) {
      console.error(`Request ${args.requestId} not found for AI analysis`);
      return;
    }

    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = getAnalysisPrompt({
        serviceName: request.serviceName,
        requiredDocuments: request.requiredDocuments,
        providedDocuments: request.providedDocuments,
        formData: request.formData || {},
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      let analysis: AnalysisResult;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        analysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseText);
        analysis = {
          status: "review_needed",
          missingDocuments: [],
          issues: ["Erreur lors de l'analyse automatique"],
          summary: "L'analyse automatique n'a pas pu être complétée. Vérification manuelle requise.",
          confidence: 0,
          suggestedAction: null,
          actionMessage: null,
        };
      }

      // Create AI note with analysis results
      await ctx.runMutation(internal.functions.ai.createAINote, {
        requestId: args.requestId,
        content: `**Analyse IA automatique**\n\n${analysis.summary}\n\n${
          analysis.missingDocuments.length > 0
            ? `**Documents manquants:**\n${analysis.missingDocuments.map(d => `- ${d}`).join('\n')}\n\n`
            : ''
        }${
          analysis.issues.length > 0
            ? `**Points d'attention:**\n${analysis.issues.map(i => `- ${i}`).join('\n')}`
            : ''
        }`,
        analysisType: "completeness",
        confidence: analysis.confidence,
      });

      // If critical issues found, trigger action required
      if (analysis.suggestedAction && analysis.actionMessage && analysis.status === "incomplete") {
        await ctx.runMutation(internal.functions.ai.triggerActionRequired, {
          requestId: args.requestId,
          type: analysis.suggestedAction,
          message: analysis.actionMessage,
          documentTypes: analysis.missingDocuments.length > 0 ? analysis.missingDocuments : undefined,
        });
      }

      console.log(`AI analysis completed for request ${args.requestId}:`, analysis.status);
    } catch (error) {
      console.error(`AI analysis failed for request ${args.requestId}:`, error);
      
      // Create error note
      await ctx.runMutation(internal.functions.ai.createAINote, {
        requestId: args.requestId,
        content: `**Analyse IA - Erreur**\n\nL'analyse automatique n'a pas pu être effectuée. Vérification manuelle recommandée.`,
        analysisType: "completeness",
        confidence: 0,
      });
    }
  },
});

/**
 * Internal query to get request data for analysis
 */
export const getRequestData = internalQuery({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    // Get service info
    const orgService = await ctx.db.get(request.orgServiceId);
    const service = orgService ? await ctx.db.get(orgService.serviceId) : null;

    // Get documents
    const documents = await Promise.all(
      (request.documents || []).map(async (docId) => {
        const doc = await ctx.db.get(docId);
        return doc?.filename || doc?.documentType || "Document sans nom";
      })
    );

    return {
      serviceName: service?.name?.fr || service?.name?.en || "Service inconnu",
      requiredDocuments: orgService?.customDocuments?.map(d => d.label?.fr || d.type) || [],
      providedDocuments: documents,
      formData: request.formData || {},
    };
  },
});

/**
 * Internal mutation to create AI note
 */
export const createAINote = internalMutation({
  args: {
    requestId: v.id("requests"),
    content: v.string(),
    analysisType: v.union(
      v.literal("completeness"),
      v.literal("document_check"),
      v.literal("data_validation")
    ),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentNotes", {
      requestId: args.requestId,
      content: args.content,
      source: "ai",
      aiAnalysisType: args.analysisType,
      aiConfidence: args.confidence,
      createdAt: Date.now(),
    });
  },
});

/**
 * Internal mutation to trigger action required from AI analysis
 */
export const triggerActionRequired = internalMutation({
  args: {
    requestId: v.id("requests"),
    type: v.union(
      v.literal("upload_document"),
      v.literal("complete_info"),
      v.literal("confirm_info")
    ),
    message: v.string(),
    documentTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return;

    // Only trigger if no action already required
    if (request.actionRequired) return;

    await ctx.db.patch(args.requestId, {
      actionRequired: {
        type: args.type,
        message: args.message,
        documentTypes: args.documentTypes,
        createdAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});
