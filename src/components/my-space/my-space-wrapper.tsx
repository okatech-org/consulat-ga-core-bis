import { api } from "@convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { MessageCircle, SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AIAssistant } from "@/components/ai";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useUserData } from "@/hooks/use-user-data";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MobileNavBar } from "./mobile-nav-bar";
import { MySpaceSidebar } from "./my-space-sidebar";

interface MySpaceWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
  return (
    <div className="relative overflow-hidden h-screen gap-6 flex bg-background">
      <div className="hidden md:block p-6 pr-0!">
        <MySpaceSidebar />
      </div>
      <main
        className={cn("flex-1 min-h-full overflow-y-auto p-6 pl-0!", className)}
      >
        {children}
      </main>
      <MobileNavBar />
    </div>
  );
}

export function MySpaceHeader() {
  const { userData } = useUserData();

  // Get unread message count
  const { data: unreadCount } = useAuthenticatedConvexQuery(
    api.functions.messages.getTotalUnreadCount,
    {},
  );

  const { t } = useTranslation();

  return (
    <header className="w-full flex items-center justify-between gap-4">
      {/* Greeting */}
      <div className="flex justify-between flex-1">
        <h1 className="text-lg md:text-2xl font-bold">
          {t("common.greeting", {
            firstName: userData?.firstName ?? userData?.name ?? "",
          })}
        </h1>

        {/* Action buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <SearchBar />
          {/* Search icon on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden bg-card rounded-full"
          >
            <SearchIcon className="size-4" />
          </Button>
          {/* Messages with badge */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:h-10 md:w-10 bg-card rounded-full relative"
          >
            <Link to="/my-space/requests">
              <MessageCircle className="size-4 md:size-5" />
              {unreadCount !== undefined && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </Button>
          <NotificationDropdown className="h-9 w-9 md:h-10 md:w-10 bg-card" />
        </div>
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <div className="relative hidden md:block">
      <Input
        className="lg:min-w-64 min-h-10 rounded-full bg-card px-4 pr-10"
        name="search"
        type="text"
        placeholder="Rechercher"
      />
      <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
    </div>
  );
}
