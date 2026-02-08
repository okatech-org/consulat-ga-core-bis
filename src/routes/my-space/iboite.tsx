/**
 * iBoîte — Messagerie Consulaire Sécurisée
 *
 * Single unified Card filling full height: Sidebar | Mail list | Detail
 * Reference: Mailbox UI with border dividers, no gaps.
 * Mobile: stacked views with back navigation.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Mail,
  Send,
  Star,
  Trash2,
  Inbox,
  Archive,
  Package,
  Truck,
  ArrowLeft,
  Loader2,
  Paperclip,
  MoreVertical,
  CheckCheck,
  PenLine,
} from "lucide-react";
import type { Locale } from "date-fns";
import { formatDistanceToNow, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import {
  MailFolder,
  MailAccountType,
  MailType,
  PackageStatus,
} from "@convex/lib/constants";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/my-space/page-header";
import {
  useAuthenticatedConvexQuery,
  useAuthenticatedPaginatedQuery,
  useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/my-space/iboite")({
  component: IBoitePage,
});

// ── Types ────────────────────────────────────────────────────────────────────

type ViewKey = "inbox" | "starred" | "sent" | "archive" | "trash" | "packages";
type MailFolderKey = Exclude<ViewKey, "packages">;

const MAIL_FOLDERS: { key: ViewKey; icon: typeof Inbox }[] = [
  { key: "inbox", icon: Inbox },
  { key: "starred", icon: Star },
  { key: "sent", icon: Send },
  { key: "archive", icon: Archive },
  { key: "trash", icon: Trash2 },
];

// ── Main Page ────────────────────────────────────────────────────────────────

function IBoitePage() {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  const [activeView, setActiveView] = useState<ViewKey>("inbox");
  const [selectedMailId, setSelectedMailId] =
    useState<Id<"digitalMail"> | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const isPackageView = activeView === "packages";
  const isMailView = !isPackageView;

  // ── Data fetching ──────────────────────────────────────────────────────

  const folderFilterArg =
    activeView === "starred" ? {}
    : isMailView ? { folder: activeView as MailFolder }
    : {};

  const {
    results: mailItems,
    status: mailPaginationStatus,
    loadMore: loadMoreMail,
  } = useAuthenticatedPaginatedQuery(
    api.functions.digitalMail.list,
    isMailView ? folderFilterArg : "skip",
    { initialNumItems: 30 },
  );

  const { data: unreadCount } = useAuthenticatedConvexQuery(
    api.functions.digitalMail.getUnreadCount,
    {},
  );

  const { data: packages } = useAuthenticatedConvexQuery(
    api.functions.deliveryPackages.listByUser,
    {},
  );

  // ── Mutations ──────────────────────────────────────────────────────────

  const { mutateAsync: markReadMutation } = useConvexMutationQuery(
    api.functions.digitalMail.markRead,
  );
  const { mutateAsync: toggleStarMutation } = useConvexMutationQuery(
    api.functions.digitalMail.toggleStar,
  );
  const { mutateAsync: moveMailMutation } = useConvexMutationQuery(
    api.functions.digitalMail.move,
  );
  const { mutateAsync: removeMailMutation } = useConvexMutationQuery(
    api.functions.digitalMail.remove,
  );
  const { mutateAsync: sendMailMutation } = useConvexMutationQuery(
    api.functions.sendMail.send,
  );

  // ── Derived data ───────────────────────────────────────────────────────

  const filteredMail = useMemo(() => {
    if (activeView === "starred") return mailItems.filter((m) => m.isStarred);
    return mailItems;
  }, [mailItems, activeView]);

  const selectedMail = useMemo(() => {
    if (!selectedMailId) return null;
    return filteredMail.find((m) => m._id === selectedMailId) ?? null;
  }, [filteredMail, selectedMailId]);

  const packageStats = useMemo(() => {
    if (!packages) return { inTransit: 0, available: 0, total: 0 };
    return {
      inTransit: packages.filter((p) => p.status === PackageStatus.InTransit)
        .length,
      available: packages.filter((p) => p.status === PackageStatus.Available)
        .length,
      total: packages.length,
    };
  }, [packages]);

  // ── Actions ────────────────────────────────────────────────────────────

  const handleSelectMail = async (mailId: Id<"digitalMail">) => {
    setSelectedMailId(mailId);
    const mail = filteredMail.find((m) => m._id === mailId);
    if (mail && !mail.isRead) {
      try {
        await markReadMutation({ id: mailId });
      } catch {
        /* noop */
      }
    }
  };

  const handleToggleStar = async (mailId: Id<"digitalMail">) => {
    try {
      const result = await toggleStarMutation({ id: mailId });
      toast.success(result ? t("iboite.starred") : t("iboite.unstarred"));
    } catch {
      toast.error(t("iboite.error"));
    }
  };

  const handleArchive = async (mailId: Id<"digitalMail">) => {
    try {
      await moveMailMutation({ id: mailId, folder: MailFolder.Archive });
      if (selectedMailId === mailId) setSelectedMailId(null);
      toast.success(t("iboite.moved"));
    } catch {
      toast.error(t("iboite.error"));
    }
  };

  const handleTrash = async (mailId: Id<"digitalMail">) => {
    try {
      await moveMailMutation({ id: mailId, folder: MailFolder.Trash });
      if (selectedMailId === mailId) setSelectedMailId(null);
      toast.success(t("iboite.moved"));
    } catch {
      toast.error(t("iboite.error"));
    }
  };

  const handleDelete = async (mailId: Id<"digitalMail">) => {
    try {
      await removeMailMutation({ id: mailId });
      if (selectedMailId === mailId) setSelectedMailId(null);
      toast.success(t("iboite.deleted"));
    } catch {
      toast.error(t("iboite.error"));
    }
  };

  const switchView = (view: ViewKey) => {
    setActiveView(view);
    setSelectedMailId(null);
  };

  const isMailLoading =
    isMailView && mailPaginationStatus === "LoadingFirstPage";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-3rem)] min-h-0 p-1">
      <div className="shrink-0">
        <PageHeader
          title={t("mySpace.screens.iboite.heading")}
          subtitle={t("mySpace.screens.iboite.subtitle")}
          icon={<Mail className="size-6" />}
        />
      </div>

      {/* ── Mobile: folder chips ──────────────────────────────────────── */}
      <div className="lg:hidden flex gap-1.5 overflow-x-auto py-3 -mx-1 px-1 scrollbar-none shrink-0">
        {MAIL_FOLDERS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchView(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
              activeView === key ?
                "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Icon className="size-3.5" />
            {t(`iboite.folders.${key}`)}
            {key === "inbox" && unreadCount != null && unreadCount > 0 && (
              <span className="bg-primary-foreground/20 rounded-full text-[10px] px-1.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => switchView("packages")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
            activeView === "packages" ?
              "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Package className="size-3.5" />
          {t("iboite.tabs.packages")}
          {packageStats.total > 0 && (
            <span className="bg-primary-foreground/20 rounded-full text-[10px] px-1.5">
              {packageStats.total}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile: stacked content ───────────────────────────────────── */}
      <div className="lg:hidden flex-1 min-h-0">
        {isPackageView ?
          <PackageList
            packages={packages ?? []}
            dateFnsLocale={dateFnsLocale}
          />
        : isMailLoading ?
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        : <AnimatePresence mode="wait">
            {selectedMail ?
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <MailDetail
                  mail={selectedMail}
                  dateFnsLocale={dateFnsLocale}
                  onBack={() => setSelectedMailId(null)}
                  onArchive={handleArchive}
                  onTrash={handleTrash}
                  onDelete={handleDelete}
                  onToggleStar={handleToggleStar}
                />
              </motion.div>
            : <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MailListInner
                  mails={filteredMail}
                  selectedMailId={selectedMailId}
                  onSelectMail={handleSelectMail}
                  onToggleStar={handleToggleStar}
                  dateFnsLocale={dateFnsLocale}
                  activeFolder={activeView as MailFolderKey}
                  paginationStatus={mailPaginationStatus}
                  onLoadMore={() => loadMoreMail(30)}
                />
              </motion.div>
            }
          </AnimatePresence>
        }
      </div>

      {/* ── Desktop: single unified card filling remaining height ──── */}
      <Card className="hidden lg:flex lg:flex-row flex-1 min-h-0 overflow-hidden p-0">
        {/* Sidebar */}
        <aside className="max-w-52 w-full border-r flex flex-col">
          {/* Compose button */}
          <div className="p-3">
            <Button
              className="w-full gap-2"
              onClick={() => setComposeOpen(true)}
            >
              <PenLine className="size-4" />
              {t("iboite.actions.compose", "Nouveau message")}
            </Button>
          </div>

          <Separator />

          <nav className="p-2 space-y-0.5">
            {MAIL_FOLDERS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchView(key)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeView === key ?
                    "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4" />
                  {t(`iboite.folders.${key}`)}
                </span>
                {key === "inbox" && unreadCount != null && unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="text-[10px] h-5 min-w-5 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <Separator className="mx-2" />

          <div className="p-2">
            <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {t("iboite.tabs.packages")}
            </p>
            <button
              onClick={() => switchView("packages")}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
                activeView === "packages" ?
                  "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2.5">
                <Package className="size-4" />
                {t("iboite.packages.title")}
              </span>
              {packageStats.total > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 min-w-5 flex items-center justify-center"
                >
                  {packageStats.total}
                </Badge>
              )}
            </button>

            {packageStats.total > 0 && (
              <div className="px-3 mt-2 space-y-1">
                {packageStats.inTransit > 0 && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Truck className="size-3" />
                    <span>
                      {packageStats.inTransit}{" "}
                      {t("iboite.packages.inTransit").toLowerCase()}
                    </span>
                  </div>
                )}
                {packageStats.available > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <Package className="size-3" />
                    <span>
                      {packageStats.available}{" "}
                      {t("iboite.packages.available").toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4">
          {/* Main content area */}
          {isPackageView ?
            <PackageList
              packages={packages ?? []}
              dateFnsLocale={dateFnsLocale}
            />
          : isMailLoading ?
            <Loader2 className="size-8 animate-spin text-primary" />
          : <>
              {/* Mail list — expands full width when no mail selected */}
              <MailListInner
                mails={filteredMail}
                selectedMailId={selectedMailId}
                onSelectMail={handleSelectMail}
                onToggleStar={handleToggleStar}
                dateFnsLocale={dateFnsLocale}
                activeFolder={activeView as MailFolderKey}
                paginationStatus={mailPaginationStatus}
                onLoadMore={() => loadMoreMail(30)}
              />

              {/* Detail — only when selected */}
              {selectedMail && (
                <MailDetail
                  mail={selectedMail}
                  dateFnsLocale={dateFnsLocale}
                  onBack={() => setSelectedMailId(null)}
                  onArchive={handleArchive}
                  onTrash={handleTrash}
                  onDelete={handleDelete}
                  onToggleStar={handleToggleStar}
                />
              )}
            </>
          }
        </main>
      </Card>

      {/* ── Compose Dialog ────────────────────────────────────────────── */}
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSend={sendMailMutation}
      />
    </div>
  );
}

// ── ComposeDialog ────────────────────────────────────────────────────────────

function ComposeDialog({
  open,
  onOpenChange,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (args: any) => Promise<any>;
}) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipientId.trim() || !content.trim()) {
      toast.error(
        t(
          "iboite.compose.fillRequired",
          "Veuillez remplir les champs obligatoires",
        ),
      );
      return;
    }
    setSending(true);
    try {
      await onSend({
        recipientId: recipientId.trim() as Id<"users">,
        accountType: MailAccountType.Personal,
        type: MailType.Email,
        subject: subject.trim() || t("iboite.mail.noSubject"),
        content: content.trim(),
      });
      toast.success(t("iboite.compose.sent", "Message envoyé"));
      setSubject("");
      setContent("");
      setRecipientId("");
      onOpenChange(false);
    } catch {
      toast.error(t("iboite.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="size-5" />
            {t("iboite.actions.compose", "Nouveau message")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="recipient">
              {t("iboite.compose.to", "Destinataire (ID)")}
            </Label>
            <Input
              id="recipient"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder={t(
                "iboite.compose.recipientPlaceholder",
                "ID du destinataire",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">
              {t("iboite.compose.subject", "Objet")}
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t(
                "iboite.compose.subjectPlaceholder",
                "Objet du message",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">
              {t("iboite.compose.message", "Message")}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t(
                "iboite.compose.messagePlaceholder",
                "Écrivez votre message...",
              )}
              rows={8}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              {t("common.cancel", "Annuler")}
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ?
                <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />}
              {t("iboite.compose.send", "Envoyer")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── MailListInner (no Card wrapper — lives inside the unified card) ──────────

function MailListInner({
  mails,
  selectedMailId,
  onSelectMail,
  onToggleStar,
  dateFnsLocale,
  activeFolder,
  paginationStatus,
  onLoadMore,
}: {
  mails: Doc<"digitalMail">[];
  selectedMailId: Id<"digitalMail"> | null;
  onSelectMail: (id: Id<"digitalMail">) => void;
  onToggleStar: (id: Id<"digitalMail">) => void;
  dateFnsLocale: Locale;
  activeFolder: MailFolderKey;
  paginationStatus: string;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();

  if (mails.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-6">
        <Inbox className="size-12 text-muted-foreground/20 mb-3" />
        <h3 className="text-sm font-medium text-muted-foreground">
          {t(`iboite.empty.${activeFolder}`)}
        </h3>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[240px]">
          {t(`iboite.empty.${activeFolder}Desc`)}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-full">
      <div className="divide-y">
        {mails.map((mail) => (
          <button
            key={mail._id}
            onClick={() => onSelectMail(mail._id)}
            className={cn(
              "w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 flex items-start gap-3",
              selectedMailId === mail._id && "bg-primary/5",
              !mail.isRead && "bg-primary/[0.02]",
            )}
          >
            <div className="pt-2 shrink-0 w-2">
              {!mail.isRead && (
                <div className="size-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-sm truncate",
                    !mail.isRead && "font-semibold",
                  )}
                >
                  {mail.sender?.name ?? "—"}
                </p>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDistanceToNow(new Date(mail.createdAt), {
                    addSuffix: false,
                    locale: dateFnsLocale,
                  })}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm truncate mt-0.5",
                  !mail.isRead ?
                    "text-foreground font-medium"
                  : "text-muted-foreground",
                )}
              >
                {mail.subject || t("iboite.mail.noSubject")}
              </p>
              {mail.preview && (
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {mail.preview}
                </p>
              )}
              {mail.attachments && mail.attachments.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Paperclip className="size-3 text-muted-foreground/50" />
                  <span className="text-[11px] text-muted-foreground/50">
                    {mail.attachments.length}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(mail._id);
              }}
              className="shrink-0 pt-1"
            >
              <Star
                className={cn(
                  "size-4 transition-colors",
                  mail.isStarred ?
                    "fill-amber-400 text-amber-400"
                  : "text-transparent hover:text-muted-foreground/30",
                )}
              />
            </button>
          </button>
        ))}
      </div>

      {paginationStatus === "CanLoadMore" && (
        <div className="p-3 text-center border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className="text-xs"
          >
            {t("iboite.actions.loadMore")}
          </Button>
        </div>
      )}
      {paginationStatus === "LoadingMore" && (
        <div className="p-3 flex justify-center border-t">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </ScrollArea>
  );
}

// ── MailDetail ───────────────────────────────────────────────────────────────

function MailDetail({
  mail,
  dateFnsLocale,
  onBack,
  onArchive,
  onTrash,
  onDelete,
  onToggleStar,
}: {
  mail: Doc<"digitalMail">;
  dateFnsLocale: Locale;
  onBack: () => void;
  onArchive: (id: Id<"digitalMail">) => void;
  onTrash: (id: Id<"digitalMail">) => void;
  onDelete: (id: Id<"digitalMail">) => void;
  onToggleStar: (id: Id<"digitalMail">) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col flex-1 min-h-full">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          <span className="lg:hidden">{t("iboite.actions.back")}</span>
        </Button>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onArchive(mail._id)}
            title={t("iboite.actions.archive")}
          >
            <Archive className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onTrash(mail._id)}
            title={t("iboite.actions.delete")}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onToggleStar(mail._id)}
            title={
              mail.isStarred ?
                t("iboite.actions.unstar")
              : t("iboite.actions.star")
            }
          >
            <Star
              className={cn(
                "size-4",
                mail.isStarred && "fill-amber-400 text-amber-400",
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {mail.folder === MailFolder.Trash && (
                <DropdownMenuItem
                  onClick={() => onDelete(mail._id)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  {t("common.delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sender row */}
      <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
            {(mail.sender?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{mail.sender?.name}</p>
            {mail.sender?.email && (
              <p className="text-xs text-muted-foreground truncate">
                {mail.sender.email}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {format(new Date(mail.createdAt), "d MMM yyyy, HH:mm", {
            locale: dateFnsLocale,
          })}
        </p>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold leading-tight">
            {mail.subject || t("iboite.mail.noSubject")}
          </h2>

          {mail.recipient && (
            <p className="text-xs text-muted-foreground">
              {t("iboite.mail.to")}: {mail.recipient.name}
              {mail.recipient.email && ` <${mail.recipient.email}>`}
            </p>
          )}

          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {mail.content}
          </div>

          {mail.attachments && mail.attachments.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                {t("iboite.mail.attachments")}{" "}
                <span className="text-muted-foreground">
                  ({mail.attachments.length})
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {mail.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border text-sm hover:bg-muted transition-colors"
                  >
                    <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[180px]">{att.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {att.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── PackageList ───────────────────────────────────────────────────────────────

function PackageList({
  packages,
  dateFnsLocale,
}: {
  packages: Doc<"deliveryPackages">[];
  dateFnsLocale: Locale;
}) {
  const { t } = useTranslation();

  if (packages.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center py-16 text-center">
        <Package className="size-12 text-muted-foreground/20 mb-3" />
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("iboite.empty.packages")}
        </h3>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[240px]">
          {t("iboite.empty.packagesDesc")}
        </p>
      </div>
    );
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof Package }
  > = {
    [PackageStatus.InTransit]: {
      label: t("iboite.packages.inTransit"),
      color:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      icon: Truck,
    },
    [PackageStatus.Available]: {
      label: t("iboite.packages.available"),
      color:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      icon: Package,
    },
    [PackageStatus.Delivered]: {
      label: t("iboite.packages.delivered"),
      color:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      icon: CheckCheck,
    },
    [PackageStatus.Pending]: {
      label: t("iboite.packages.pending"),
      color: "bg-muted text-muted-foreground border-muted",
      icon: Package,
    },
    [PackageStatus.Returned]: {
      label: t("iboite.packages.returned"),
      color:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
      icon: Package,
    },
  };

  return (
    <div className="space-y-3 min-h-full">
      {packages.map((pkg) => {
        const status =
          statusConfig[pkg.status] ?? statusConfig[PackageStatus.Pending];
        const StatusIcon = status.icon;
        return (
          <div
            key={pkg._id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div
              className={cn("p-2.5 rounded-lg border shrink-0", status.color)}
            >
              <StatusIcon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{pkg.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("iboite.packages.sender")}: {pkg.sender}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-xs", status.color)}
                >
                  {status.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span>
                  {t("iboite.packages.tracking")}:{" "}
                  <span className="font-mono">{pkg.trackingNumber}</span>
                </span>
                {pkg.estimatedDelivery && (
                  <span>
                    {t("iboite.packages.estimatedDelivery")}:{" "}
                    {format(new Date(pkg.estimatedDelivery), "d MMM yyyy", {
                      locale: dateFnsLocale,
                    })}
                  </span>
                )}
              </div>
              {pkg.events && pkg.events.length > 0 && (
                <div className="mt-3 space-y-1.5 border-l-2 border-muted pl-3 ml-1">
                  {pkg.events
                    .slice(-3)
                    .reverse()
                    .map((event: any, i: number) => (
                      <div key={i} className="text-xs">
                        <p className="text-muted-foreground">
                          {format(new Date(event.timestamp), "d MMM, HH:mm", {
                            locale: dateFnsLocale,
                          })}
                        </p>
                        <p className="text-foreground">{event.description}</p>
                        {event.location && (
                          <p className="text-muted-foreground">
                            {event.location}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
