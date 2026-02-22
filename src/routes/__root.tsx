import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useMatches,
	useRouteContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { DevAccountSwitcher } from "@/components/auth/DevAccountSwitcher";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getToken } from "@/lib/auth-server";
import { AIAssistant } from "../components/ai";
import { FormFillProvider } from "../components/ai/FormFillContext";
import Header from "../components/Header";
import ConvexProvider from "../integrations/convex/provider";
import I18nProvider from "../integrations/i18n/provider";
import appCss from "../styles.css?url";

// SSR: get auth token from cookies
const getAuth = createServerFn({ method: "GET" }).handler(async () => {
	return await getToken();
});

interface MyRouterContext {
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title:
					"Consulat.ga - Services Consulaires Digitalisés | République Gabonaise",
			},
			{
				name: "description",
				content:
					"Plateforme officielle des services consulaires de la République Gabonaise. Demandes de passeport, visa, état civil, inscription consulaire et légalisation de documents en ligne.",
			},
			{
				property: "og:title",
				content: "Consulat.ga - Services Consulaires Digitalisés",
			},
			{
				property: "og:description",
				content:
					"Plateforme officielle des services consulaires de la République Gabonaise pour les citoyens à l'étranger.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "theme-color",
				content: "#3b82f6",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	beforeLoad: async (ctx) => {
		// Only call getAuth() during SSR — on the client, auth is handled
		// by ConvexBetterAuthProvider, so we skip the server round-trip
		// that was causing ~300-500ms delays on every navigation.
		if (typeof window !== "undefined") {
			return { isAuthenticated: false, token: null };
		}
		const token = await getAuth();
		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}
		return {
			isAuthenticated: !!token,
			token,
		};
	},

	shellComponent: RootDocument,
	component: RootLayout,
});

const routesWithOwnLayout = [
	"/admin",
	"/sign-in",
	"/sign-up",
	"/dashboard",
	"/my-space",
	"/post-login-redirect",
];

function RootLayout() {
	const matches = useMatches();

	const hasOwnLayout = matches.some((match) =>
		routesWithOwnLayout.some((route) => match.fullPath.startsWith(route)),
	);

	const mainRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (hasOwnLayout) return;

		const handleWheel = (e: WheelEvent) => {
			if (!mainRef.current) return;

			let target = e.target as HTMLElement | null;

			while (target) {
				if (target === mainRef.current) {
					return;
				}

				const style = window.getComputedStyle(target);
				const overflowY = style.overflowY;
				const isScrollable =
					(overflowY === "auto" || overflowY === "scroll") &&
					target.scrollHeight > target.clientHeight;

				if (isScrollable) {
					return;
				}

				target = target.parentElement;
			}

			mainRef.current.scrollTop += e.deltaY;
		};

		window.addEventListener("wheel", handleWheel);
		return () => window.removeEventListener("wheel", handleWheel);
	}, [hasOwnLayout]);

	if (hasOwnLayout) {
		return <Outlet />;
	}

	return (
		<div className="h-screen overflow-hidden flex flex-col">
			<Header />
			<main
				id="main-scrollable-area"
				ref={mainRef}
				className="overflow-y-auto flex-1"
			>
				<Outlet />
				<Footer />
			</main>

			<AIAssistant />
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const context = useRouteContext({ from: Route.id });

	return (
		<html lang="fr">
			<head>
				<HeadContent />
			</head>
			<body className="h-screen overflow-hidden">
				<I18nProvider>
					<ConvexProvider initialToken={context?.token}>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<FormFillProvider>
								{children}
								<Toaster richColors />
								<DevAccountSwitcher />
							</FormFillProvider>
						</ThemeProvider>
					</ConvexProvider>
				</I18nProvider>

				<Scripts />
			</body>
		</html>
	);
}
