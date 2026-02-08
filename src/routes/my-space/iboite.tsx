/**
 * iBoîte - Boîte aux Lettres Souveraine
 * Layout inspiré de iCV: Panneau de contrôle gauche + Prévisualisation document droite
 * Actions déplacées dans le panneau gauche pour maximiser l'espace de lecture
 *
 * CONVEX INTEGRATION: Uses digitalMail functions for persistent storage
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Package,
  Mail,
  MessageCircle,
  MapPin,
  Copy,
  Check,
  Send,
  Plus,
  X,
  Building2,
  User,
  Reply,
  Star,
  Trash2,
  Inbox,
  Truck,
  Printer,
  Download,
  AlertCircle,
  FileText,
  QrCode,
  ChevronDown,
  Home,
  Briefcase,
  Users,
  ArrowLeft,
  Share2,
  Paperclip,
  Archive,
  Forward,
  ReplyAll,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  MailAccountType,
  MailFolder,
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

export const Route = createFileRoute("/my-space/iboite")({
  component: IBoitePage,
});

// Types
type SectionType = "courriers" | "colis" | "emails";
type FolderType = "inbox" | "sent" | "archive" | "trash" | "starred";
type AccountType = MailAccountType;

interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon: typeof Home;
  color: string;
  address: {
    label: string;
    fullAddress: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    qrCode: string;
  };
  email: string;
}

// Dynamic accounts generator from user context
function generateUserAccounts(
  userName: string,
  userEmail: string,
  representationCity: string,
): Account[] {
  const firstName = userName.split(" ")[0];
  return [
    {
      id: "personal",
      name: "Personnel",
      type: MailAccountType.Personal,
      icon: Home,
      color: "from-green-500 to-emerald-600",
      address: {
        label: userName,
        fullAddress: `Point Relais Consulat`,
        street: "Représentation Consulaire",
        city: representationCity,
        country: "Gabon",
        postalCode: "BP 1000",
        qrCode: `CONSULAT-${firstName.toUpperCase().slice(0, 3)}`,
      },
      email: userEmail,
    },
    {
      id: "professional",
      name: "Professionnel",
      type: MailAccountType.Professional,
      icon: Briefcase,
      color: "from-blue-500 to-indigo-600",
      address: {
        label: `${firstName} - Professionnel`,
        fullAddress: "Adresse Professionnelle",
        street: "Quartier Affaires",
        city: representationCity,
        country: "Gabon",
        postalCode: "BP 5000",
        qrCode: `CONSULAT-PRO-${firstName.toUpperCase().slice(0, 3)}`,
      },
      email: `pro.${firstName.toLowerCase()}@consulat.ga`,
    },
    {
      id: "association",
      name: "Association",
      type: MailAccountType.Association,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      address: {
        label: "Associations Gabonaises",
        fullAddress: "Maison des Gabonais",
        street: "Représentation Consulaire",
        city: representationCity,
        country: "Gabon",
        postalCode: "BP 2500",
        qrCode: `CONSULAT-ASSO-${firstName.toUpperCase().slice(0, 3)}`,
      },
      email: `asso.${firstName.toLowerCase()}@consulat.ga`,
    },
  ];
}

function IBoitePage() {
  const { t } = useTranslation();
  const { data: profile } = useAuthenticatedConvexQuery(
    api.functions.profiles.getMine,
    {},
  );

  // Generate accounts dynamically from user context
  const userAccounts = useMemo(() => {
    const userName =
      profile ?
        `${profile.identity?.firstName ?? ""} ${profile.identity?.lastName ?? ""}`.trim()
      : "Citoyen Gabonais";
    const userEmail = profile?.contacts?.email ?? "citoyen@consulat.ga";
    const city = "Libreville";
    return generateUserAccounts(userName, userEmail, city);
  }, [profile]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Initialize account when userAccounts change
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(userAccounts[0]);
    }
  }, [userAccounts, selectedAccount]);

  // Convex queries and mutations for digital mail (paginated)
  const {
    results: mailFromConvex,
    status: mailPaginationStatus,
    loadMore: loadMoreMail,
  } = useAuthenticatedPaginatedQuery(
    api.functions.digitalMail.list,
    selectedAccount ? { accountType: selectedAccount.type } : "skip",
    { initialNumItems: 30 },
  );
  const { data: packagesFromConvex } = useAuthenticatedConvexQuery(
    api.functions.deliveryPackages.listByUser,
    {},
  );
  const { mutateAsync: markReadMutation } = useConvexMutationQuery(
    api.functions.digitalMail.markRead,
  );
  const { mutateAsync: toggleStarMutation } = useConvexMutationQuery(
    api.functions.digitalMail.toggleStar,
  );
  const { mutateAsync: moveMailMutation } = useConvexMutationQuery(
    api.functions.digitalMail.move,
  );
  const { mutateAsync: _deleteMailMutation } = useConvexMutationQuery(
    api.functions.digitalMail.remove,
  );
  const { mutateAsync: _sendMailMutation } = useConvexMutationQuery(
    api.functions.sendMail.send,
  );

  // State
  const [activeSection, setActiveSection] = useState<SectionType>("courriers");
  const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
  const [emailFolder, setEmailFolder] = useState<FolderType>("inbox");
  const [selectedMailId, setSelectedMailId] =
    useState<Id<"digitalMail"> | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);

  // Preview container ref for scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Calculate scale for A4 preview - using full container
  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const container = previewContainerRef.current;
        const containerWidth = container.clientWidth - 24;
        const containerHeight = container.clientHeight - 24;
        const a4Width = 595;
        const a4Height = 842;
        const scaleX = containerWidth / a4Width;
        const scaleY = containerHeight / a4Height;
        setPreviewScale(Math.min(scaleX, scaleY, 1));
      }
    };
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [selectedMailId]);

  // Derived data from Convex
  const mail = mailFromConvex || [];
  const letters = mail.filter((m) => m.type === "letter");
  const emails = mail.filter((m) => m.type === "email");

  // Filtered data
  const filteredLetters = letters.filter((l) => l.folder === currentFolder);
  const filteredEmails =
    emailFolder === "starred" ?
      emails.filter((e) => e.isStarred)
    : emails.filter((e) => e.folder === emailFolder);

  const accountPackages = packagesFromConvex ?? [];

  const unreadLetters = letters.filter(
    (l) => l.folder === "inbox" && !l.isRead,
  ).length;
  const availablePackages = accountPackages.filter(
    (p) => p.status === PackageStatus.Available,
  ).length;
  const unreadEmails = emails.filter(
    (e) => e.folder === "inbox" && !e.isRead,
  ).length;

  // Selected mail item
  const selectedMail =
    selectedMailId ? mail.find((m) => m._id === selectedMailId) : null;

  const copyAddress = () => {
    if (!selectedAccount) return;
    navigator.clipboard.writeText(
      `${selectedAccount.address.fullAddress}\n${selectedAccount.address.street}\n${selectedAccount.address.postalCode} ${selectedAccount.address.city}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const moveLetter = async (id: Id<"digitalMail">, target: FolderType) => {
    try {
      await moveMailMutation({ id, folder: target as MailFolder });
      setSelectedMailId(null);
      toast.success(t("iboite.moved", "Courrier déplacé"));
    } catch (error) {
      toast.error(t("iboite.moveError", "Erreur lors du déplacement"));
    }
  };

  const toggleEmailStar = async (id: Id<"digitalMail">) => {
    try {
      await toggleStarMutation({ id });
    } catch (error) {
      toast.error(t("iboite.starError", "Erreur lors de la mise à jour"));
    }
  };

  const handleSelectMail = async (mailItem: (typeof mail)[0]) => {
    setSelectedMailId(mailItem._id);
    if (!mailItem.isRead) {
      try {
        await markReadMutation({ id: mailItem._id });
      } catch {
        // Silently fail for mark as read
      }
    }
  };

  // Section badges
  const sectionBadges = {
    courriers: unreadLetters,
    colis: availablePackages,
    emails: unreadEmails,
  };

  // Loading state while accounts are being generated or mail is loading
  if (!selectedAccount || mailPaginationStatus === "LoadingFirstPage") {
    return (
      <div className="space-y-6 p-1">
        <PageHeader
          title={t("mySpace.screens.iboite.heading", "iBoîte")}
          subtitle={t(
            "mySpace.screens.iboite.subtitle",
            "Votre messagerie consulaire sécurisée",
          )}
          icon={<Inbox className="h-6 w-6 text-primary" />}
        />
        <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t("iboite.loading", "Chargement de votre boîte...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <PageHeader
        title={t("mySpace.screens.iboite.heading", "iBoîte")}
        subtitle={t(
          "mySpace.screens.iboite.subtitle",
          "Votre messagerie consulaire sécurisée",
        )}
        icon={<Inbox className="h-6 w-6 text-primary" />}
      />
      <div className="h-[calc(100vh-12rem)] flex gap-2 overflow-hidden">
        {/* Left Panel - Controls */}
        <div
          className={cn(
            "w-72 shrink-0 rounded-xl flex flex-col overflow-hidden",
            "glass-card",
          )}
        >
          {/* Account Selector - Compact */}
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
                  "bg-gradient-to-r text-white shadow-sm",
                  selectedAccount.color,
                )}
              >
                <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                  <selectedAccount.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate">
                    {selectedAccount.name}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {selectedAccount.email}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    accountDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {accountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-50"
                  >
                    {userAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setAccountDropdownOpen(false);
                          setSelectedMailId(null);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                          selectedAccount.id === account.id &&
                            "bg-slate-100 dark:bg-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md bg-gradient-to-r flex items-center justify-center text-white",
                            account.color,
                          )}
                        >
                          <account.icon className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {account.name}
                        </span>
                        {selectedAccount.id === account.id && (
                          <Check className="w-3 h-3 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Address - Ultra Compact */}
            <div className="mt-2 p-1.5 rounded bg-slate-50 dark:bg-white/5 text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">
                {selectedAccount.address.street}, {selectedAccount.address.city}
              </span>
              <button
                onClick={copyAddress}
                className="p-0.5 rounded hover:bg-slate-200 ml-auto shrink-0"
              >
                {copied ?
                  <Check className="w-2.5 h-2.5" />
                : <Copy className="w-2.5 h-2.5" />}
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-700">
            <div className="space-y-0.5">
              {[
                {
                  id: "courriers" as SectionType,
                  label: "Courriers",
                  icon: Mail,
                  color: "text-blue-500",
                },
                {
                  id: "colis" as SectionType,
                  label: "Colis",
                  icon: Package,
                  color: "text-amber-500",
                },
                {
                  id: "emails" as SectionType,
                  label: "eMails",
                  icon: MessageCircle,
                  color: "text-green-500",
                },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSelectedMailId(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                    activeSection === section.id ?
                      "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <section.icon
                      className={cn(
                        "w-3.5 h-3.5",
                        activeSection === section.id ?
                          "text-primary"
                        : section.color,
                      )}
                    />
                    {section.label}
                  </div>
                  {sectionBadges[section.id] > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs font-bold",
                        activeSection === section.id ?
                          "bg-primary text-white"
                        : "bg-primary/20 text-primary",
                      )}
                    >
                      {sectionBadges[section.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Folders + Actions based on section */}
          <div className="flex-1 overflow-auto p-2.5">
            {activeSection === "courriers" && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  Dossiers
                </p>
                <div className="space-y-0.5">
                  {[
                    {
                      id: "inbox" as FolderType,
                      label: "Réception",
                      icon: Inbox,
                      count: unreadLetters,
                    },
                    { id: "sent" as FolderType, label: "Expédiés", icon: Send },
                    {
                      id: "archive" as FolderType,
                      label: "Archives",
                      icon: Archive,
                      count: letters.filter((l) => l.folder === "archive")
                        .length,
                    },
                    {
                      id: "trash" as FolderType,
                      label: "Poubelle",
                      icon: Trash2,
                    },
                  ].map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setCurrentFolder(folder.id);
                        setSelectedMailId(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                        currentFolder === folder.id ?
                          "bg-white dark:bg-white/10 shadow-sm text-foreground"
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <folder.icon className="w-3.5 h-3.5" />
                        {folder.label}
                      </div>
                      {folder.count && folder.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                          {folder.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* New Letter Button */}
                <button className="w-full mt-3 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Nouveau courrier
                </button>

                {/* Letter Actions - Show when letter selected */}
                {selectedMail && selectedMail.type === "letter" && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                      Actions
                    </p>
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 text-primary">
                        <Reply className="w-3.5 h-3.5" />
                        Répondre
                      </button>
                      <div className="grid grid-cols-2 gap-1">
                        <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                          <Download className="w-3.5 h-3.5 text-blue-500" />
                          Télécharger
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          Imprimer
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {selectedMail.folder !== "archive" &&
                          selectedMail.folder !== "trash" && (
                            <button
                              onClick={() =>
                                moveLetter(selectedMail._id, "archive")
                              }
                              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Archiver
                            </button>
                          )}
                        <button
                          className={cn(
                            "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5",
                            (selectedMail.folder === "archive" ||
                              selectedMail.folder === "trash") &&
                              "col-span-2",
                          )}
                        >
                          <Share2 className="w-3.5 h-3.5 text-green-500" />
                          Partager
                        </button>
                      </div>
                      <button
                        onClick={() => moveLetter(selectedMail._id, "trash")}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeSection === "colis" && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  Statut
                </p>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Package className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">
                        {availablePackages} à retirer
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">
                        {
                          accountPackages.filter(
                            (p) => p.status === PackageStatus.InTransit,
                          ).length
                        }{" "}
                        en transit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-center">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-mono text-muted-foreground">
                    {selectedAccount.address.qrCode}
                  </p>
                </div>
              </>
            )}

            {activeSection === "emails" && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  Dossiers
                </p>
                <div className="space-y-0.5">
                  {[
                    {
                      id: "inbox" as FolderType,
                      label: "Boîte de réception",
                      icon: Inbox,
                      count: unreadEmails,
                    },
                    { id: "starred" as any, label: "Favoris", icon: Star },
                    { id: "sent" as FolderType, label: "Envoyés", icon: Send },
                    {
                      id: "trash" as FolderType,
                      label: "Corbeille",
                      icon: Trash2,
                    },
                  ].map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setEmailFolder(folder.id);
                        setSelectedMailId(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                        emailFolder === folder.id ?
                          "bg-white dark:bg-white/10 shadow-sm text-foreground"
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <folder.icon
                          className={cn(
                            "w-3.5 h-3.5",
                            folder.id === "starred" &&
                              emailFolder === folder.id &&
                              "text-amber-500 fill-amber-500",
                          )}
                        />
                        {folder.label}
                      </div>
                      {folder.count && folder.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                          {folder.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Compose Email Button */}
                <button
                  onClick={() => setShowComposeEmail(true)}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouveau message
                </button>

                {/* Email Actions - Show when email selected */}
                {selectedMail && selectedMail.type === "email" && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                      Actions
                    </p>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="relative group">
                          <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 text-primary">
                            <Reply className="w-3.5 h-3.5" />
                            Répondre
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">
                              <ReplyAll className="w-3.5 h-3.5 text-slate-500" />
                              Répondre à tous
                            </button>
                          </div>
                        </div>
                        <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                          <Forward className="w-3.5 h-3.5 text-blue-500" />
                          Transférer
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() =>
                            moveLetter(selectedMail._id, "archive")
                          }
                          className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-500" />
                          Archiver
                        </button>
                        <button
                          onClick={() => moveLetter(selectedMail._id, "trash")}
                          className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Back Button when viewing - at bottom */}
          {selectedMailId && (
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedMailId(null)}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-white/10 hover:bg-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la liste
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Content - FULL HEIGHT FOR PDF */}
        <div
          ref={previewContainerRef}
          className={cn(
            "flex-1 rounded-xl flex flex-col overflow-hidden",
            "glass-card",
          )}
        >
          {/* COURRIERS SECTION */}
          {activeSection === "courriers" &&
            (selectedMail && selectedMail.type === "letter" ?
              /* Letter Preview - FULL SCREEN */
              <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-slate-200/50 dark:bg-slate-900/50">
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "center center",
                  }}
                  className="bg-white shadow-lg rounded-sm"
                >
                  <div className="w-[595px] min-h-[842px] p-10">
                    {/* Letter Header */}
                    <div className="flex justify-between mb-6">
                      <div className="text-xs text-slate-600 whitespace-pre-line">
                        {selectedMail.sender?.address ||
                          selectedMail.sender?.name}
                      </div>
                      <div className="text-xs font-semibold text-right whitespace-pre-line">
                        {selectedMail.recipient?.name}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 text-right mb-5">
                      Libreville, le{" "}
                      {format(selectedMail.createdAt, "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                    <div className="text-base font-bold mb-5 pb-2 border-b border-slate-200">
                      Objet : {selectedMail.subject}
                    </div>
                    <div className="text-sm leading-6 whitespace-pre-wrap text-justify">
                      {selectedMail.content}
                    </div>
                    {selectedMail.attachments &&
                      selectedMail.attachments.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <p className="text-xs font-bold text-slate-600 uppercase mb-2">
                            Pièces jointes
                          </p>
                          <div className="space-y-1.5">
                            {selectedMail.attachments.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 rounded bg-slate-50 border text-xs"
                              >
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="flex-1 font-medium">
                                  {a.name}
                                </span>
                                <span className="text-slate-500">{a.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    <div className="mt-6 text-right">
                      <span className="text-lg text-blue-900 italic">
                        {selectedMail.sender?.name}
                      </span>
                    </div>
                    {/* Action Required Badge on document */}
                    {selectedMail.letterType === "action_required" &&
                      selectedMail.folder === "inbox" && (
                        <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-700">
                              Action requise
                            </p>
                            <p className="text-xs text-red-600">
                              Réponse attendue avant le{" "}
                              {selectedMail.dueDate ?
                                format(selectedMail.dueDate, "dd/MM/yyyy")
                              : "prochainement"}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            : /* Letter List */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                  <h2 className="text-sm font-bold text-foreground">
                    {currentFolder === "inbox" ?
                      "Réception"
                    : currentFolder === "sent" ?
                      "Expédiés"
                    : currentFolder === "archive" ?
                      "Archives"
                    : "Poubelle"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredLetters.length} courrier(s)
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  {filteredLetters.length === 0 ?
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Mail className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-xs">Aucun courrier</p>
                    </div>
                  : <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredLetters.map((letter) => (
                        <motion.button
                          key={letter._id}
                          onClick={() => handleSelectMail(letter)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "relative rounded-lg overflow-hidden text-left transition-all",
                            "bg-white dark:bg-white/5 hover:bg-slate-50",
                            "border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-sm",
                            !letter.isRead && "ring-2 ring-primary/30",
                          )}
                        >
                          <div className="relative h-20 bg-[#f5f2eb] dark:bg-[#e8e4dc] overflow-hidden">
                            <div
                              className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#ebe7df] to-[#dfd9ce]"
                              style={{
                                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                              }}
                            />
                            <div className="absolute top-2 left-0 right-0 bottom-0 bg-[#f5f2eb] dark:bg-[#e8e4dc] border-t border-black/5 p-2 flex flex-col justify-end">
                              {letter.letterType === "action_required" &&
                                !letter.isRead && (
                                  <span className="absolute top-0.5 right-1 text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                                    URGENT
                                  </span>
                                )}
                              {letter.folder === "archive" && (
                                <span className="absolute top-0.5 right-1 text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                  ARCHIVÉ
                                </span>
                              )}
                              <div className="bg-white/70 p-1.5 rounded">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {letter.folder === "sent" ?
                                    letter.recipient?.name
                                  : letter.sender?.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {letter.subject}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="px-2 py-1.5 bg-white dark:bg-slate-900/50 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(letter.createdAt, {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                            {letter.folder !== "archive" &&
                              letter.folder !== "trash" &&
                              letter.folder !== "sent" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLetter(letter._id, "archive");
                                  }}
                                  className="p-1 rounded hover:bg-amber-100 text-amber-600"
                                  title="Archiver"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  }
                </div>
              </div>)}

          {/* COLIS SECTION */}
          {activeSection === "colis" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                <h2 className="text-sm font-bold text-foreground">Mes Colis</h2>
                <p className="text-xs text-muted-foreground">
                  {accountPackages.length} colis
                </p>
              </div>
              <div className="flex-1 overflow-auto p-3">
                {accountPackages.length === 0 ?
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Package className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs">Aucun colis</p>
                  </div>
                : <div className="space-y-2">
                    {accountPackages.map((pkg) => (
                      <motion.div
                        key={pkg._id}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                          "bg-white dark:bg-white/5",
                          "border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-sm",
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            pkg.status === PackageStatus.Available ?
                              "bg-amber-500/10"
                            : "bg-blue-500/10",
                          )}
                        >
                          {pkg.status === PackageStatus.Available ?
                            <Package className="w-6 h-6 text-amber-500" />
                          : <Truck className="w-6 h-6 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {pkg.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            De: {pkg.sender}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">
                            {pkg.trackingNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white",
                              pkg.status === PackageStatus.Available ?
                                "bg-amber-500"
                              : "bg-blue-500",
                            )}
                          >
                            {pkg.status === PackageStatus.Available ?
                              "À retirer"
                            : "En transit"}
                          </span>
                          {pkg.estimatedDelivery && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Arrivée: {format(pkg.estimatedDelivery, "dd/MM")}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                }
              </div>
            </div>
          )}

          {/* EMAILS SECTION */}
          {activeSection === "emails" &&
            (selectedMail && selectedMail.type === "email" ?
              /* Email Detail View - FULL SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                {/* Email Header - On document */}
                <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        selectedMail.sender?.type === "admin" ?
                          "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-green-500 to-emerald-600",
                      )}
                    >
                      {selectedMail.sender?.type === "admin" ?
                        <Building2 className="w-5 h-5 text-white" />
                      : <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground">
                        {selectedMail.sender?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        &lt;{selectedMail.sender?.email}&gt;
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        À: {selectedMail.recipient?.email} •{" "}
                        {format(selectedMail.createdAt, "dd MMM yyyy, HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleEmailStar(selectedMail._id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-all shrink-0",
                        selectedMail.isStarred ?
                          "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          selectedMail.isStarred &&
                            "fill-amber-500 text-amber-500",
                        )}
                      />
                      {selectedMail.isStarred ?
                        "Retirer des favoris"
                      : "Ajouter aux favoris"}
                    </button>
                  </div>
                  <h1 className="text-lg font-semibold mt-3">
                    {selectedMail.subject}
                  </h1>
                </div>

                {/* Email Content - FULL */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                      {selectedMail.content}
                    </p>
                    {selectedMail.attachments &&
                      selectedMail.attachments.length > 0 && (
                        <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Pièces jointes
                          </p>
                          {selectedMail.attachments.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border"
                            >
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium flex-1">
                                {a.name}
                              </span>
                              <button className="text-xs text-primary hover:underline">
                                Télécharger
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            : /* Email List View */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                  <h2 className="text-sm font-bold text-foreground">
                    {emailFolder === "inbox" ?
                      "Boîte de réception"
                    : emailFolder === "starred" ?
                      "Favoris"
                    : emailFolder === "sent" ?
                      "Envoyés"
                    : "Corbeille"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredEmails.length} message(s)
                  </p>
                </div>
                <div className="flex-1 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmails.length === 0 ?
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-xs">Aucun message</p>
                    </div>
                  : filteredEmails.map((email) => (
                      <button
                        key={email._id}
                        onClick={() => handleSelectMail(email)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                          !email.isRead && "bg-blue-50/50 dark:bg-blue-500/5",
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEmailStar(email._id);
                          }}
                          className="p-0.5 rounded hover:bg-slate-100 mt-1"
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              email.isStarred ?
                                "text-amber-500 fill-amber-500"
                              : "text-slate-300 hover:text-slate-400",
                            )}
                          />
                        </button>
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                            email.sender?.type === "admin" ?
                              "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-green-500 to-emerald-600",
                          )}
                        >
                          {email.sender?.type === "admin" ?
                            <Building2 className="w-4 h-4 text-white" />
                          : <User className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm truncate",
                                !email.isRead ?
                                  "font-bold text-foreground"
                                : "text-muted-foreground",
                              )}
                            >
                              {emailFolder === "sent" ?
                                email.recipient?.name
                              : email.sender?.name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(email.createdAt, {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-xs truncate",
                              !email.isRead ?
                                "font-semibold text-foreground"
                              : "text-muted-foreground",
                            )}
                          >
                            {email.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {email.preview}
                          </p>
                        </div>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </button>
                    ))
                  }
                </div>
              </div>)}
        </div>
      </div>

      {/* Compose Email Modal */}
      <AnimatePresence>
        {showComposeEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComposeEmail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl bg-background border border-border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-base font-bold">Nouveau message</h3>
                <button
                  onClick={() => setShowComposeEmail(false)}
                  className="p-1.5 rounded hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="À"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Objet"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <textarea
                  placeholder="Votre message..."
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted">
                  <Paperclip className="w-4 h-4" />
                  Joindre
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowComposeEmail(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
                  >
                    Annuler
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
