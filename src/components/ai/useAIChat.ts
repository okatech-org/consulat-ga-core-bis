import { useState, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useLocation } from "@tanstack/react-router";

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
  const chat = useAction(api.ai.chat.chat);
  
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

      // Handle actions
      if (response.actions && response.actions.length > 0) {
        setPendingActions(response.actions);
      }
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [chat, conversationId, isLoading, location.pathname]);

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
    clearActions,
    newConversation,
    loadConversation,
  };
}
