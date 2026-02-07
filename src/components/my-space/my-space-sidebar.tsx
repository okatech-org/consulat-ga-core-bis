"use client";

import { SignOutButton } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCopy,
  FileText,
  Inbox,
  LogOut,
  Mail,
  Moon,
  ScrollText,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface MySpaceSidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * Text that fades in/out smoothly when the sidebar expands/collapses.
 * Always stays in the DOM — uses opacity + width transitions instead of
 * conditional rendering to avoid jarring layout shifts.
 */
function SidebarText({
  isExpanded,
  children,
  className,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "truncate text-sm whitespace-nowrap transition-[opacity] duration-200",
        isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0 overflow-hidden",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MySpaceSidebar({
  isExpanded = false,
  onToggle,
}: MySpaceSidebarProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const navItems: NavItem[] = [
    {
      title: t("mySpace.nav.profile"),
      url: "/my-space",
      icon: User,
    },
    {
      title: t("mySpace.nav.requests"),
      url: "/my-space/services", // Not yet implemented — links to dashboard
      icon: FileText,
    },
    {
      title: t("mySpace.nav.timeline"),
      url: "/my-space/requests", // UI to adapt
      icon: ClipboardCopy,
    },
    {
      title: t("mySpace.nav.documents"),
      url: "/my-space/vault",
      icon: ShieldCheck,
    },
    {
      title: t("mySpace.nav.iboite"),
      url: "/my-space/iboite", // Not yet implemented — links to dashboard
      icon: Mail,
    },
    {
      title: t("mySpace.nav.icv", "iCV"),
      url: "/my-space/cv",
      icon: ScrollText,
    },
    {
      title: t("mySpace.nav.companies", "Entreprises"),
      url: "/my-space/companies",
      icon: Building2,
    },
    {
      title: t("mySpace.nav.associations", "Associations"),
      url: "/my-space/associations",
      icon: Users,
    },
    {
      title: t("mySpace.nav.settings", "Paramètres"),
      url: "/my-space/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => {
    if (url === "/my-space") {
      return location.pathname === "/my-space";
    }
    return location.pathname.startsWith(url);
  };

  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        data-slot="sidebar"
        className={cn(
          "flex flex-col py-3 px-4 bg-card border border-border h-full overflow-hidden",
          "rounded-2xl transition-[width] duration-300 ease-in-out",
          isExpanded ? "w-56 items-stretch" : "w-16 items-center",
        )}
      >
        {/* Logo */}
        <div className={cn("mb-4", isExpanded ? "px-2" : "")}>
          <Link
            to="/"
            className={"flex items-center" + (isExpanded ? " gap-2" : "")}
          >
            <div className="size-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">C</span>
            </div>
            <div
              className={cn(
                "flex flex-col text-foreground transition-[opacity] duration-200 overflow-hidden whitespace-nowrap",
                isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0",
              )}
            >
              <span className="text-sm font-semibold">CONSULAT</span>
              <span className="text-foreground text-xs">Espace Numérique</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav
          className={cn(
            "flex flex-col gap-1.5 flex-1",
            !isExpanded && "items-center",
          )}
        >
          {navItems.map((item) => {
            const active = isActive(item.url);
            const button = (
              <Button
                asChild
                variant="ghost"
                size={isExpanded ? "default" : "icon"}
                className={cn(
                  "transition-all duration-200",
                  isExpanded ?
                    "w-full justify-start gap-3 px-3 h-10 rounded-xl"
                  : "w-11 h-11 rounded-full",
                  active ?
                    "bg-primary/10 text-primary border border-primary/20 font-semibold hover:bg-primary/15 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Link to={item.url}>
                  <item.icon className="size-5 shrink-0" />
                  <SidebarText isExpanded={isExpanded}>
                    {item.title}
                  </SidebarText>
                  {!isExpanded && <span className="sr-only">{item.title}</span>}
                </Link>
              </Button>
            );

            // In collapsed mode, wrap with Tooltip
            if (!isExpanded) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.title}>{button}</div>;
          })}
        </nav>

        {/* Bottom Controls */}
        <div
          className={cn(
            "flex flex-col gap-1.5 pt-4 border-t border-border/50",
            !isExpanded && "items-center",
          )}
        >
          {/* Language + Settings + Dark Mode row */}
          <div
            className={
              "flex items-center gap-1 px-1" + (!isExpanded ? " flex-col" : "")
            }
          >
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 px-2"
            >
              <span className="text-base leading-none">
                {currentLang === "fr" ? "🇫🇷" : "🇬🇧"}
              </span>
              <span className="text-xs font-medium uppercase">
                {currentLang}
              </span>
            </Button>

            <div className="flex-1" />

            {/* Toggle Sidebar Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={onToggle}
                >
                  {isExpanded ?
                    <ChevronsLeft className="size-4" />
                  : <ChevronsRight className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isExpanded ?
                  t("mySpace.nav.collapse", "Réduire")
                : t("mySpace.nav.expand", "Agrandir")}
              </TooltipContent>
            </Tooltip>

            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  {theme === "dark" ?
                    <Sun className="size-4" />
                  : <Moon className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {theme === "dark" ?
                  t("theme.light", "Mode clair")
                : t("theme.dark", "Mode sombre")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Logout */}
          <SignOutButton>
            <NavAction
              isExpanded={isExpanded}
              icon={LogOut}
              label={t("common.logout", "Déconnexion")}
              variant="destructive"
            />
          </SignOutButton>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

interface NavActionProps {
  isExpanded: boolean;
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "ghost" | "default" | "destructive";
}

function NavAction({
  isExpanded,
  icon: Icon,
  label,
  href,
  onClick,
  variant = "default",
}: NavActionProps) {
  const content = (
    <Button
      asChild={!!href}
      variant={variant}
      size={isExpanded ? "default" : "icon"}
      onClick={onClick}
      className={cn(
        "transition-all duration-200",
        isExpanded ?
          "w-full justify-start gap-3 px-3 h-10 rounded-xl"
        : "w-11 h-11 rounded-full",
      )}
    >
      {href ?
        <Link to={href}>
          <Icon className="size-5 shrink-0" />
          <SidebarText isExpanded={isExpanded}>{label}</SidebarText>
          {!isExpanded && <span className="sr-only">{label}</span>}
        </Link>
      : <>
          <Icon className="size-5 shrink-0" />
          <SidebarText isExpanded={isExpanded}>{label}</SidebarText>
          {!isExpanded && <span className="sr-only">{label}</span>}
        </>
      }
    </Button>
  );

  if (!isExpanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
