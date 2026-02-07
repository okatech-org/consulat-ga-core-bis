import { ServiceCategory, CountryCode } from "@convex/lib/constants.ts";
import { Link } from "@tanstack/react-router";
import { changeLanguage } from "i18next";
import {
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Globe,
  GraduationCap,
  Menu,
  Newspaper,
  Phone,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ClerkHeader from "../integrations/clerk/header-user.tsx";
import { FlagIcon } from "./ui/flag-icon";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  const languages = [
    { label: "Français", value: "fr", country: CountryCode.FR },
    { label: "English", value: "en", country: CountryCode.GB },
  ];

  const navLinks = [
    {
      label: t("header.nav.worldNetwork"),
      href: "/orgs",
      icon: Globe,
    },
    { label: t("header.nav.news"), href: "/news", icon: Newspaper },
    {
      label: t("header.nav.information"),
      href: "/information",
      icon: FileText,
    },
    { label: t("header.nav.academy"), href: "/academy", icon: GraduationCap },
    { label: t("header.nav.community"), href: "/community", icon: Users },
  ];

  return (
    <>
      <header className="relative z-50">
        {/* Top Bar */}
        <div className="bg-primary text-white text-sm hidden md:block">
          <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a
                href="tel:+33142996868"
                className="flex items-center gap-2 hover:text-white/80 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +33 1 42 99 68 68
              </a>
              <span className="text-white/50">|</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("header.hours")}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Switcher Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white/80 hover:bg-white/10 h-7 px-2 gap-1.5"
                  >
                    <FlagIcon
                      countryCode={
                        languages.find((l) => l.value === i18n.language)
                          ?.country || CountryCode.FR
                      }
                      size={16}
                      className="w-4 h-auto rounded-sm"
                    />
                    <span className="uppercase text-xs font-medium">
                      {i18n.language}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.value}
                      onClick={() => changeLanguage(lang.value)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FlagIcon
                          countryCode={lang.country}
                          size={16}
                          className="w-4 h-auto rounded-sm"
                        />
                        <span>{lang.label}</span>
                      </span>
                      {i18n.language === lang.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg text-foreground leading-tight">
                  Consulat.ga
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("header.country")}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Services Dropdown */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="font-medium">
                  <Link
                    to={"/services"}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {t("header.nav.services")}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="bg-card rounded-xl shadow-xl border border-border p-2 min-w-[220px]">
                    {Object.entries(ServiceCategory).map(([key, value]) => (
                      <Link
                        key={key}
                        to={`/services?category=${value}` as string}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {t(`services.categoriesMap.${value}`)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Nav Links */}
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="font-medium"
                >
                  <Link
                    to={link.href}
                    activeProps={{
                      className:
                        "bg-primary text-white hover:bg-primary/90 hover:text-white",
                    }}
                  >
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ClerkHeader />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="lg:hidden"
                aria-label={t("header.openMenu")}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-card z-50 transform transition-transform duration-300 ease-out lg:hidden flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-foreground">Consulat.ga</div>
              <div className="text-xs text-muted-foreground">
                {t("header.country")}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label={t("header.closeMenu")}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Language Switcher */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.value}
                variant={i18n.language === lang.value ? "default" : "outline"}
                size="sm"
                onClick={() => changeLanguage(lang.value)}
                className="flex-1"
              >
                <span className="mr-1">{lang.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors mb-1"
              activeProps={{
                className:
                  "flex items-center gap-3 p-3 rounded-xl bg-primary text-white mb-1",
              }}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}

          <Separator className="my-4" />

          {/* Services Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setServicesExpanded(!servicesExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{t("header.nav.services")}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${servicesExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {servicesExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {Object.entries(ServiceCategory).map(([key, value]) => (
                  <Link
                    key={key}
                    to={`/services?category=${value}` as string}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-sm"
                    activeProps={{
                      className:
                        "flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary text-sm",
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t(`services.categoriesMap.${value}`)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="sm:hidden">
            <ClerkHeader />
          </div>
        </div>
      </aside>
    </>
  );
}
