import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";
import { ChevronRight, Globe, FileText, Users } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative z-10 min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/video_idn_ga.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-4 lg:px-8 py-16">
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold border border-primary/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-primary" />
            </span>
            {t("heroCore.badge")}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
            {t("heroCore.title")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-green-500">
              {t("heroCore.titleHighlight")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t("heroCore.description")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/my-space">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
                >
                  {t("heroCore.cta.register")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                <Link to="/my-space">
                  {t("heroCore.cta.access")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </SignedIn>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base bg-white/10 backdrop-blur-sm border-white/50 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/services">{t("heroCore.cta.services")}</Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span>
                <strong>50+</strong> {t("heroCore.stats.representations")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>
                <strong>15+</strong> {t("heroCore.stats.services")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>
                <strong>200K+</strong> {t("heroCore.stats.users")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
