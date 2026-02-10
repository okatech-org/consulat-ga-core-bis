/**
 * iBoîte — Messagerie Consulaire Sécurisée
 *
 * Single unified Card filling full height: Sidebar | Mail list | Detail
 * Reference: Mailbox UI with border dividers, no gaps.
 * Mobile: stacked views with back navigation.
 */

import React, { useState, useMemo } from "react";
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
  User,
  Landmark,
  Handshake,
  Building2,
  BadgeCheck,
  Check,
  ChevronsUpDown,
  Reply,
} from "lucide-react";
import type { Locale } from "date-fns";
import { formatDistanceToNow, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import {
  MailFolder,
  MailOwnerType,
  MailType,
  PackageStatus,
  OrganizationType,
} from "@convex/lib/constants";

// Official org types — shown with a special badge
const OFFICIAL_ORG_TYPES = new Set([
  OrganizationType.Embassy,
  OrganizationType.GeneralConsulate,
  OrganizationType.Consulate,
  OrganizationType.HonoraryConsulate,
  OrganizationType.HighCommission,
  OrganizationType.PermanentMission,
]);

const OWNER_TYPE_ICONS: Record<string, typeof User> = {
  [MailOwnerType.Profile]: User,
  [MailOwnerType.Organization]: Landmark,
  [MailOwnerType.Association]: Handshake,
  [MailOwnerType.Company]: Building2,
};
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [replyData, setReplyData] = useState<{
    recipientOwnerId: string;
    recipientOwnerType: string;
    recipientName: string;
    subject: string;
    quotedContent: string;
    threadId?: string;
    inReplyTo?: Id<"digitalMail">;
  } | null>(null);

  // Active account (mailbox entity)
  const [activeOwnerId, setActiveOwnerId] = useState<string | undefined>(
    undefined,
  );
  const [activeOwnerType, setActiveOwnerType] = useState<string | undefined>(
    undefined,
  );

  const isPackageView = activeView === "packages";
  const isMailView = !isPackageView;

  // ── Data fetching ──────────────────────────────────────────────────────

  // Accounts with unread counts for the sidebar selector
  const { data: accounts } = useAuthenticatedConvexQuery(
    api.functions.digitalMail.getAccountsWithUnread,
    {},
  );

  const folderFilterArg = {
    ...(activeView === "starred" ? {}
    : isMailView ? { folder: activeView as MailFolder }
    : {}),
    ...(activeOwnerId ?
      { ownerId: activeOwnerId as any, ownerType: activeOwnerType as any }
    : {}),
  };

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
    activeOwnerId ?
      { ownerId: activeOwnerId as any, ownerType: activeOwnerType as any }
    : {},
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
                  onReply={(mail) => {
                    setReplyData({
                      recipientOwnerId: mail.sender.entityId,
                      recipientOwnerType: mail.sender.entityType,
                      recipientName: mail.sender.name,
                      subject:
                        mail.subject?.startsWith("Re: ") ?
                          mail.subject
                        : `Re: ${mail.subject || t("iboite.mail.noSubject")}`,
                      quotedContent: `\n\n--- ${t("iboite.reply.originalMessage")} ---\n${mail.sender.name} (${format(new Date(mail.createdAt), "d MMM yyyy, HH:mm", { locale: dateFnsLocale })}):\n${mail.content}`,
                      threadId: mail.threadId || mail._id,
                      inReplyTo: mail._id,
                    });
                    setComposeOpen(true);
                  }}
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
        <aside className="max-w-56 w-full border-r flex flex-col">
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

          {/* Account selector */}
          {accounts && accounts.length > 0 && (
            <>
              <div className="p-2 space-y-0.5">
                <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {t("iboite.accounts.title", "Comptes")}
                </p>
                {accounts.map((acct) => (
                  <button
                    key={acct.ownerId}
                    onClick={() => {
                      setActiveOwnerId(acct.ownerId);
                      setActiveOwnerType(acct.ownerType);
                      setSelectedMailId(null);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
                      activeOwnerId === acct.ownerId ?
                        "bg-primary/10 text-primary font-medium"
                      : (
                        !activeOwnerId &&
                        acct.ownerType === MailOwnerType.Profile
                      ) ?
                        "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {(() => {
                        const Icon = OWNER_TYPE_ICONS[acct.ownerType] ?? Mail;
                        return <Icon className="size-4 shrink-0" />;
                      })()}
                      <span className="truncate">{acct.name}</span>
                      {acct.orgType &&
                        OFFICIAL_ORG_TYPES.has(
                          acct.orgType as OrganizationType,
                        ) && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1 shrink-0 gap-0.5"
                          >
                            <BadgeCheck className="size-3" />
                            {t("iboite.accounts.official", "Officiel")}
                          </Badge>
                        )}
                    </span>
                    {acct.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="text-[10px] h-5 min-w-5 flex items-center justify-center"
                      >
                        {acct.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              <Separator className="mx-2" />
            </>
          )}

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

        <main className="flex-1 flex min-h-0 min-w-0">
          {/* Main content area */}
          {isPackageView ?
            <div className="flex-1 overflow-auto p-4">
              <PackageList
                packages={packages ?? []}
                dateFnsLocale={dateFnsLocale}
              />
            </div>
          : isMailLoading ?
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          : <>
              {/* Mail list — fixed width column with its own scroll */}
              <div
                className={cn(
                  "border-r flex flex-col min-h-0",
                  selectedMail ? "w-80 shrink-0" : "flex-1",
                )}
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
              </div>

              {/* Detail — fills remaining space, or placeholder */}
              <div className="flex-1 min-h-0 min-w-0">
                {selectedMail ?
                  <MailDetail
                    mail={selectedMail}
                    dateFnsLocale={dateFnsLocale}
                    onBack={() => setSelectedMailId(null)}
                    onArchive={handleArchive}
                    onTrash={handleTrash}
                    onDelete={handleDelete}
                    onToggleStar={handleToggleStar}
                    onReply={(mail) => {
                      setReplyData({
                        recipientOwnerId: mail.sender.entityId,
                        recipientOwnerType: mail.sender.entityType,
                        recipientName: mail.sender.name,
                        subject:
                          mail.subject?.startsWith("Re: ") ?
                            mail.subject
                          : `Re: ${mail.subject || t("iboite.mail.noSubject")}`,
                        quotedContent: `\n\n--- ${t("iboite.reply.originalMessage")} ---\n${mail.sender.name} (${format(new Date(mail.createdAt), "d MMM yyyy, HH:mm", { locale: dateFnsLocale })}):\n${mail.content}`,
                        threadId: mail.threadId || mail._id,
                        inReplyTo: mail._id,
                      });
                      setComposeOpen(true);
                    }}
                  />
                : <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <Mail className="size-12 text-muted-foreground/20 mb-3" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t("iboite.mail.selectToRead")}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-[240px]">
                      {t("iboite.mail.selectToReadDesc")}
                    </p>
                  </div>
                }
              </div>
            </>
          }
        </main>
      </Card>

      {/* ── Compose Dialog ────────────────────────────────────────────── */}
      <ComposeDialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) setReplyData(null);
        }}
        onSend={sendMailMutation}
        accounts={accounts ?? []}
        initialData={replyData}
      />
    </div>
  );
}

// ── ComposeDialog ────────────────────────────────────────────────────────────

type Account = {
  ownerId: string;
  ownerType: string;
  name: string;
  logoUrl?: string;
  orgType?: string;
  unreadCount: number;
};

function ComposeDialog({
  open,
  onOpenChange,
  onSend,
  accounts,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (args: any) => Promise<any>;
  accounts: Account[];
  initialData?: {
    recipientOwnerId: string;
    recipientOwnerType: string;
    recipientName: string;
    subject: string;
    quotedContent: string;
    threadId?: string;
    inReplyTo?: Id<"digitalMail">;
  } | null;
}) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [senderAccountIdx, setSenderAccountIdx] = useState(0);
  const [sending, setSending] = useState(false);

  // Recipient search state
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientPopoverOpen, setRecipientPopoverOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MailOwnerType | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    ownerId: string;
    ownerType: string;
    name: string;
  } | null>(null);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRecipientSearchChange = (value: string) => {
    setRecipientSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  // Pre-fill fields when opening as a reply
  React.useEffect(() => {
    if (open && initialData) {
      setSelectedRecipient({
        ownerId: initialData.recipientOwnerId,
        ownerType: initialData.recipientOwnerType,
        name: initialData.recipientName,
      });
      setSubject(initialData.subject);
      setContent(initialData.quotedContent);
    } else if (!open) {
      setSubject("");
      setContent("");
      setSelectedRecipient(null);
      setRecipientSearch("");
      setDebouncedSearch("");
      setTypeFilter(null);
    }
  }, [open, initialData]);

  const searchArgs =
    debouncedSearch.trim().length >= 2 ?
      { query: debouncedSearch.trim(), ...(typeFilter ? { typeFilter } : {}) }
    : ("skip" as const);
  const { data: searchResults } = useAuthenticatedConvexQuery(
    api.functions.digitalMail.searchRecipients,
    searchArgs,
  );

  const senderAccount = accounts[senderAccountIdx];

  const handleSend = async () => {
    if (!selectedRecipient || !content.trim()) {
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
        senderOwnerId: senderAccount?.ownerId,
        senderOwnerType: senderAccount?.ownerType,
        recipientOwnerId: selectedRecipient.ownerId,
        recipientOwnerType: selectedRecipient.ownerType,
        type: MailType.Email,
        subject: subject.trim() || t("iboite.mail.noSubject"),
        content: content.trim(),
        ...(initialData?.threadId ? { threadId: initialData.threadId } : {}),
        ...(initialData?.inReplyTo ? { inReplyTo: initialData.inReplyTo } : {}),
      });
      toast.success(t("iboite.compose.sent", "Message envoyé"));
      setSubject("");
      setContent("");
      setSelectedRecipient(null);
      setRecipientSearch("");
      setDebouncedSearch("");
      setTypeFilter(null);
      onOpenChange(false);
    } catch {
      toast.error(t("iboite.error"));
    } finally {
      setSending(false);
    }
  };

  // Translate raw enum subtitles from backend
  const subtitleLabels: Record<string, string> = {
    // OrganizationType
    embassy: t("orgs.type.embassy", "Ambassade"),
    general_consulate: t("orgs.type.generalConsulate", "Consulat Général"),
    consulate: t("orgs.type.consulate", "Consulat"),
    honorary_consulate: t("orgs.type.honoraryConsulate", "Consulat Honoraire"),
    high_commission: t("orgs.type.highCommission", "Haut-Commissariat"),
    permanent_mission: t("orgs.type.permanentMission", "Mission Permanente"),
    third_party: t("orgs.type.thirdParty", "Partenaire tiers"),
    // AssociationType
    cultural: t("associations.type.cultural", "Culturelle"),
    sports: t("associations.type.sports", "Sportive"),
    religious: t("associations.type.religious", "Religieuse"),
    professional: t("associations.type.professional", "Professionnelle"),
    solidarity: t("associations.type.solidarity", "Solidarité"),
    education: t("associations.type.education", "Éducation"),
    youth: t("associations.type.youth", "Jeunesse"),
    women: t("associations.type.women", "Femmes"),
    student: t("associations.type.student", "Étudiante"),
    // ActivitySector
    technology: t("companies.sector.technology", "Technologie"),
    commerce: t("companies.sector.commerce", "Commerce"),
    services: t("companies.sector.services", "Services"),
    industry: t("companies.sector.industry", "Industrie"),
    agriculture: t("companies.sector.agriculture", "Agriculture"),
    health: t("companies.sector.health", "Santé"),
    culture: t("companies.sector.culture", "Culture"),
    tourism: t("companies.sector.tourism", "Tourisme"),
    transport: t("companies.sector.transport", "Transport"),
    construction: t("companies.sector.construction", "Construction"),
    // Common
    other: t("common.other", "Autre"),
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
          {/* Sender selector */}
          {accounts.length > 1 && (
            <div className="space-y-2">
              <Label>{t("iboite.compose.from", "De")}</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={senderAccountIdx}
                onChange={(e) => setSenderAccountIdx(Number(e.target.value))}
              >
                {accounts.map((acct, i) => (
                  <option key={acct.ownerId} value={i}>
                    {acct.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Recipient picker with search */}
          <div className="space-y-2">
            <Label>{t("iboite.compose.to", "Destinataire")}</Label>
            {/* Type filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: null, label: t("iboite.compose.filterAll", "Tous") },
                {
                  value: MailOwnerType.Profile,
                  label: t("iboite.compose.filterProfiles", "Profils"),
                  icon: User,
                },
                {
                  value: MailOwnerType.Organization,
                  label: t("iboite.compose.filterOrgs", "Organisations"),
                  icon: Landmark,
                },
                {
                  value: MailOwnerType.Association,
                  label: t("iboite.compose.filterAssocs", "Associations"),
                  icon: Handshake,
                },
                {
                  value: MailOwnerType.Company,
                  label: t("iboite.compose.filterCompanies", "Entreprises"),
                  icon: Building2,
                },
              ].map((chip) => {
                const isActive = typeFilter === chip.value;
                const ChipIcon = chip.icon;
                return (
                  <Button
                    key={chip.value ?? "all"}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="h-7 rounded-full px-3 text-xs gap-1"
                    onClick={() => setTypeFilter(chip.value)}
                  >
                    {ChipIcon && <ChipIcon className="size-3" />}
                    {chip.label}
                  </Button>
                );
              })}
            </div>
            <Popover
              open={recipientPopoverOpen}
              onOpenChange={setRecipientPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={recipientPopoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedRecipient ?
                    <span className="flex items-center gap-2 truncate">
                      {(() => {
                        const Icon =
                          OWNER_TYPE_ICONS[selectedRecipient.ownerType] ?? Mail;
                        return <Icon className="size-4" />;
                      })()}
                      {selectedRecipient.name}
                    </span>
                  : <span className="text-muted-foreground">
                      {t(
                        "iboite.compose.recipientPlaceholder",
                        "Rechercher un destinataire...",
                      )}
                    </span>
                  }
                  <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t(
                      "iboite.compose.searchRecipient",
                      "Rechercher par nom...",
                    )}
                    value={recipientSearch}
                    onValueChange={handleRecipientSearchChange}
                  />
                  <CommandList>
                    {debouncedSearch.trim().length < 2 ?
                      <CommandEmpty>
                        {t(
                          "iboite.compose.typeToSearch",
                          "Tapez au moins 2 caractères...",
                        )}
                      </CommandEmpty>
                    : !searchResults ?
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      </div>
                    : searchResults.length === 0 ?
                      <CommandEmpty>
                        {t("iboite.compose.noResults", "Aucun résultat.")}
                      </CommandEmpty>
                    : <CommandGroup>
                        {searchResults.map((result: any) => {
                          const Icon =
                            OWNER_TYPE_ICONS[result.ownerType] ?? Mail;
                          return (
                            <CommandItem
                              key={result.ownerId}
                              value={result.ownerId}
                              onSelect={() => {
                                setSelectedRecipient({
                                  ownerId: result.ownerId,
                                  ownerType: result.ownerType,
                                  name: result.name,
                                });
                                setRecipientPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  (
                                    selectedRecipient?.ownerId ===
                                      result.ownerId
                                  ) ?
                                    "opacity-100"
                                  : "opacity-0",
                                )}
                              />
                              <Icon className="mr-2 size-4 text-muted-foreground" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm truncate">
                                  {result.name}
                                </span>
                                {result.subtitle && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {subtitleLabels[result.subtitle] ??
                                      result.subtitle}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    }
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
  onReply,
}: {
  mail: Doc<"digitalMail">;
  dateFnsLocale: Locale;
  onBack: () => void;
  onArchive: (id: Id<"digitalMail">) => void;
  onTrash: (id: Id<"digitalMail">) => void;
  onDelete: (id: Id<"digitalMail">) => void;
  onToggleStar: (id: Id<"digitalMail">) => void;
  onReply: (mail: Doc<"digitalMail">) => void;
}) {
  const { t } = useTranslation();

  // Thread query — fetch all messages in the same thread
  const threadArgs =
    mail.threadId ? { threadId: mail.threadId } : ("skip" as const);
  const { data: threadMessages } = useAuthenticatedConvexQuery(
    api.functions.digitalMail.getThread,
    threadArgs,
  );

  // If we have thread data with 2+ messages, show conversation view
  const hasThread = threadMessages && threadMessages.length > 1;

  return (
    <div className="flex flex-col flex-1 min-h-full">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          <span className="lg:hidden">{t("iboite.actions.back")}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(mail)}
          className="gap-1.5"
          title={t("iboite.actions.reply")}
        >
          <Reply className="size-4" />
          <span className="hidden sm:inline">{t("iboite.actions.reply")}</span>
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

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold leading-tight">
            {mail.subject || t("iboite.mail.noSubject")}
          </h2>

          {mail.recipient && (
            <p className="text-xs text-muted-foreground">
              {t("iboite.mail.to")}: {mail.recipient.name}
            </p>
          )}

          {/* Thread conversation view */}
          {hasThread ?
            <div className="space-y-3">
              {threadMessages.map((msg) => {
                const isCurrent = msg._id === mail._id;
                return (
                  <div
                    key={msg._id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      isCurrent ?
                        "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-muted",
                    )}
                  >
                    {/* Message header */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                          {(msg.sender?.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {msg.sender?.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                        {format(new Date(msg.createdAt), "d MMM yyyy, HH:mm", {
                          locale: dateFnsLocale,
                        })}
                      </p>
                    </div>
                    {/* Message content */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-9">
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          : /* Single message view (no thread) */
            <>
              {/* Sender row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                    {(mail.sender?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {mail.sender?.name}
                    </p>
                    {mail.sender?.entityType && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {(() => {
                          const Icon =
                            OWNER_TYPE_ICONS[mail.sender.entityType] ?? Mail;
                          return <Icon className="size-3" />;
                        })()}
                        {t(
                          `iboite.ownerType.${mail.sender.entityType}`,
                          mail.sender.entityType,
                        )}
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

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {mail.content}
              </div>
            </>
          }

          {mail.attachments && mail.attachments.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                {t("iboite.mail.attachments")}{" "}
                <span className="text-muted-foreground">
                  ({mail.attachments.length})
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {mail.attachments.map(
                  (
                    att: { name: string; size: string; storageId?: string },
                    i: number,
                  ) => (
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
                  ),
                )}
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
