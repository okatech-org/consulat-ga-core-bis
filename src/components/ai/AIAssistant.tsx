"use client";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Loader2,
  User,
  X,
  ExternalLink,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useAIChat, type Message, type AIAction } from "./useAIChat";
import { cn } from "@/lib/utils";

function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        isAssistant ? "bg-muted/50" : "bg-primary/5"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary"
          )}
        >
          {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-sm font-medium">
          {isAssistant ? "Assistant Consulat" : "Vous"}
        </p>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function ActionPreview({
  actions,
  onConfirm,
  onReject,
  isLoading,
}: {
  actions: AIAction[];
  onConfirm: (action: AIAction) => void;
  onReject: (action: AIAction) => void;
  isLoading: boolean;
}) {
  const getActionLabel = (action: AIAction) => {
    switch (action.type) {
      case "createRequest":
        return `Créer une demande: ${action.args.serviceSlug}`;
      case "cancelRequest":
        return `Annuler la demande: ${action.args.requestId}`;
      default:
        return action.type;
    }
  };

  const getActionIcon = (action: AIAction) => {
    switch (action.type) {
      case "createRequest":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "cancelRequest":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <ExternalLink className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="border-t bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-amber-700 border-amber-300">
          Action(s) en attente de confirmation
        </Badge>
      </div>
      {actions.map((action, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-background rounded-md p-3 border border-amber-200"
        >
          <div className="flex items-center gap-2">
            {getActionIcon(action)}
            <span className="text-sm font-medium">{getActionLabel(action)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(action)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onConfirm(action)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmer"
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}


function ChatInput({
  onSend,
  isLoading,
}: {
  onSend: (message: string) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Comment puis-je vous aider ?"
          className="min-h-[60px] max-h-[120px] resize-none"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="shrink-0 self-end"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const {
    messages,
    isLoading,
    error,
    pendingActions,
    sendMessage,
    confirmAction,
    rejectAction,
    newConversation,
  } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          aria-label="Ouvrir l'assistant IA"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col p-0 w-full sm:max-w-md"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 py-3 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="text-base">Assistant Consulat</SheetTitle>
              <p className="text-xs text-muted-foreground">
                Je suis là pour vous aider
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={newConversation}
              title="Nouvelle conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Bienvenue !</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Je suis l'assistant IA du Consulat du Gabon. Comment puis-je vous aider aujourd'hui ?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Mon profil",
                  "Mes demandes",
                  "Services disponibles",
                  "Renouveler mon passeport",
                ].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Réflexion en cours...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Actions Preview */}
        {pendingActions.length > 0 && (
          <ActionPreview
            actions={pendingActions}
            onConfirm={confirmAction}
            onReject={rejectAction}
            isLoading={isLoading}
          />
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  );
}
