import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Hook pour détecter si on est sur mobile
function useIsMobile(breakpoint = 768) {
	const subscribe = (callback: () => void) => {
		const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		mediaQuery.addEventListener("change", callback);
		return () => mediaQuery.removeEventListener("change", callback);
	};

	const getSnapshot = () =>
		window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
	const getServerSnapshot = () => false; // SSR: assume desktop

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();
	const isMobile = useIsMobile();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			position={isMobile ? "top-center" : "bottom-right"}
			visibleToasts={3}
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
