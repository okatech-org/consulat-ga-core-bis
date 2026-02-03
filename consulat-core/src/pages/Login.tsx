import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TestTube2, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center text-white p-12">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/video_idn_ga.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 to-black/60" />

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Bienvenue sur votre Espace Consulaire Numérique
          </h1>
          <p className="text-lg text-blue-100">
            Accédez à tous vos services administratifs, suivez vos demandes en temps réel et restez connecté avec votre communauté.
          </p>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
              <p>Identifiez-vous de manière sécurisée</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
              <p>Accédez à votre tableau de bord personnel</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold">3</div>
              <p>Gérez vos démarches en quelques clics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-background">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-border">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">Connexion</h2>
            <p className="mt-2 text-gray-600 dark:text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                required
                className="h-12 bg-background"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12 bg-background"
              />
            </div>

            <Button className="w-full h-12 text-lg bg-gradient-apple hover:opacity-90 border-0" size="lg">
              Se connecter <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300">
              <AlertCircle className="h-4 w-4 text-blue-800 dark:text-blue-300" />
              <AlertDescription>
                Vos données sont chiffrées et protégées.
              </AlertDescription>
            </Alert>

            {isDev && (
              <div className="pt-6 border-t">
                <p className="text-xs text-center text-muted-foreground uppercase mb-4">Mode Développement</p>
                <Link to="/demo-portal">
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                  >
                    <TestTube2 className="mr-2 h-4 w-4" />
                    Accès Rapide (Mode Démo)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
