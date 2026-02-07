"use client";

import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutGrid,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    {
      title: t("mySpace.nav.dashboard", "Tableau de bord"),
      url: "/my-space",
      icon: LayoutGrid,
    },
    {
      title: t("mySpace.nav.requests", "Mes demandes"),
      url: "/my-space/requests",
      icon: FileText,
    },
    {
      title: t("mySpace.nav.appointments", "Rendez-vous"),
      url: "/my-space/appointments",
      icon: Calendar,
    },
    {
      title: t("mySpace.nav.vault", "Coffre-fort"),
      url: "/my-space/vault",
      icon: Shield,
    },
    {
      title: t("mySpace.nav.cv", "Mon iCV"),
      url: "/my-space/cv",
      icon: Sparkles,
    },
    {
      title: t("mySpace.nav.children", "Mes enfants"),
      url: "/my-space/children",
      icon: Users,
    },
    {
      title: t("mySpace.nav.associations", "Associations"),
      url: "/my-space/associations",
      icon: Users,
    },
    {
      title: t("mySpace.nav.companies", "Entreprises"),
      url: "/my-space/companies",
      icon: Building2,
    },
    {
      title: t("mySpace.nav.profile", "Mon profil"),
      url: "/my-space/profile",
      icon: User,
    },
  ];

  const isActive = (url: string) => {
    if (url === "/my-space") {
      return location.pathname === "/my-space";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col py-3 px-2 bg-card border border-border h-full overflow-hidden",
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
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.url}>{button}</div>;
          })}
        </nav>

        {/* Bottom Actions */}
        <div
          className={cn(
            "flex flex-col gap-1.5 pt-4 border-t border-border/50",
            !isExpanded && "items-center",
          )}
        >
          {/* Toggle Button */}
          {onToggle && (
            <NavAction
              isExpanded={isExpanded}
              icon={isExpanded ? ChevronsLeft : ChevronsRight}
              label={
                isExpanded ?
                  t("mySpace.nav.collapse", "Réduire")
                : t("mySpace.nav.expand", "Agrandir")
              }
              onClick={onToggle}
            />
          )}

          {/* Settings */}
          <NavAction
            isExpanded={isExpanded}
            icon={Settings}
            label={t("mySpace.nav.settings", "Paramètres")}
            href="/my-space/settings"
          />

          {/* Logout */}
          <SignOutButton>
            <NavAction
              isExpanded={isExpanded}
              icon={LogOut}
              label={t("common.logout", "Se déconnecter")}
              variant="destructive"
            />
          </SignOutButton>

          {/* User Avatar */}
          {isLoaded && user && (
            <UserAvatar user={user} isExpanded={isExpanded} />
          )}
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
  variant?: "default" | "destructive";
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
      variant="ghost"
      size={isExpanded ? "default" : "icon"}
      onClick={onClick}
      className={cn(
        "transition-all duration-200",
        isExpanded ?
          "w-full justify-start gap-3 px-3 h-10 rounded-xl"
        : "w-11 h-11 rounded-full",
        variant === "destructive" ?
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
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

interface UserAvatarProps {
  user: {
    imageUrl: string;
    fullName: string | null;
    firstName: string | null;
    username: string | null;
  };
  isExpanded: boolean;
}

function UserAvatar({ user, isExpanded }: UserAvatarProps) {
  const { t } = useTranslation();

  const avatar = (
    <Link
      to="/my-space/profile"
      className={cn(
        "mt-2 flex items-center gap-3 transition-colors",
        isExpanded && "px-2 py-1.5 rounded-xl hover:bg-muted",
      )}
    >
      <Avatar className="w-10 h-10 shrink-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col min-w-0 transition-[opacity] duration-200 overflow-hidden whitespace-nowrap",
          isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0",
        )}
      >
        <span className="text-sm font-medium truncate text-foreground">
          {user.fullName ||
            user.username ||
            t("mySpace.nav.profile", "Mon profil")}
        </span>
      </div>
    </Link>
  );

  if (!isExpanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {user.fullName ||
            user.username ||
            t("mySpace.nav.profile", "Mon profil")}
        </TooltipContent>
      </Tooltip>
    );
  }

  return avatar;
}
