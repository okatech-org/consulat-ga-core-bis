import { useState, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useLocation, useRouter } from "@tanstack/react-router";

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type AIAction = {
  type: string;
  args: Record<string, unknown>;
  requiresConfirmation: boolean;
  reason?: string;
};

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<AIAction[]>([]);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  
  const location = useLocation();
  const router = useRouter();
  const chat = useAction(api.ai.chat.chat);
  const executeActionMutation = useAction(api.ai.chat.executeAction);
  
  // Get conversation history
  const conversations = useQuery(api.ai.chat.listConversations);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chat({
        conversationId: conversationId ?? undefined,
        message: content,
        currentPage: location.pathname,
      });

      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Handle actions - separate UI actions from confirmable ones
      if (response.actions && response.actions.length > 0) {
        const uiActions = response.actions.filter(
          (a) => a.type === "navigateTo" || a.type === "fillForm"
        );
        const confirmableActions = response.actions.filter(
          (a) => a.requiresConfirmation
        );

        // Execute UI actions immediately
        for (const action of uiActions) {
          await executeUIAction(action);
        }

        // Queue actions that need confirmation
        if (confirmableActions.length > 0) {
          setPendingActions(confirmableActions);
        }
      }
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [chat, conversationId, isLoading, location.pathname]);

  // Execute UI actions (navigateTo, fillForm) - these don't need confirmation
  const executeUIAction = useCallback(async (action: AIAction) => {
    switch (action.type) {
      case "navigateTo": {
        const route = action.args.route as string;
        if (route) {
          router.navigate({ to: route });
        }
        break;
      }
      case "fillForm": {
        // TODO: Implement form filling in Phase 3
        console.log("fillForm action:", action.args);
        break;
      }
    }
  }, [router]);

  // Confirm and execute a pending action
  const confirmAction = useCallback(async (action: AIAction) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await executeActionMutation({
        actionType: action.type,
        actionArgs: action.args,
        conversationId: conversationId ?? undefined,
      });

      // Remove from pending
      setPendingActions((prev) => prev.filter((a) => a !== action));

      // Add result message
      const resultMessage: Message = {
        role: "assistant",
        content: result.success
          ? `✅ Action exécutée: ${JSON.stringify(result.data)}`
          : `❌ Erreur: ${result.error}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, resultMessage]);

      return result;
    } catch (err) {
      setError((err as Error).message || "Erreur lors de l'exécution");
      return { success: false, error: (err as Error).message };
    } finally {
      setIsLoading(false);
    }
  }, [executeActionMutation, conversationId]);

  // Reject a pending action
  const rejectAction = useCallback((action: AIAction) => {
    setPendingActions((prev) => prev.filter((a) => a !== action));
    
    // Add rejection message
    const rejectMessage: Message = {
      role: "assistant",
      content: `Action "${action.type}" annulée.`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, rejectMessage]);
  }, []);

  const clearActions = useCallback(() => {
    setPendingActions([]);
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setPendingActions([]);
    setError(null);
  }, []);

  const loadConversation = useCallback((convId: Id<"conversations">) => {
    // Find the conversation from the list
    const conv = conversations?.find((c) => c._id === convId);
    if (conv) {
      setConversationId(convId);
      setMessages(
        conv.messages
          .filter((m) => m.role !== "tool")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.timestamp,
          }))
      );
    }
  }, [conversations]);

  return {
    messages,
    isLoading,
    error,
    pendingActions,
    conversationId,
    conversations,
    sendMessage,
    confirmAction,
    rejectAction,
    clearActions,
    newConversation,
    loadConversation,
  };
}
