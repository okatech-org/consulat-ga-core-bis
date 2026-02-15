import {
	Award,
	BarChart3,
	BookOpen,
	Briefcase,
	Building,
	Building2,
	CalendarDays,
	ChartLine,
	CheckCircle,
	ClipboardList,
	Crown,
	Eye,
	FileEdit,
	FileText,
	Gavel,
	Globe,
	HandHelping,
	Handshake,
	Home,
	Landmark,
	Link,
	Lock,
	type LucideIcon,
	Medal,
	Megaphone,
	ScrollText,
	Settings,
	Shield,
	ShieldAlert,
	Stamp,
	Ticket,
	User,
	Users,
	Wallet,
	Wrench,
} from "lucide-react";

/**
 * Maps a Lucide icon name string (e.g. "Crown", "Shield") to the actual component.
 * Used for rendering icons stored as strings in the backend (roles, templates, etc.).
 */
const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
	Award,
	BarChart3,
	BookOpen,
	Briefcase,
	Building,
	Building2,
	CalendarDays,
	CheckCircle,
	ChartLine,
	ClipboardList,
	Crown,
	Eye,
	FileEdit,
	FileText,
	Gavel,
	Globe,
	HandHelping,
	Handshake,
	Home,
	Landmark,
	Link,
	Lock,
	Medal,
	Megaphone,
	ScrollText,
	Settings,
	Shield,
	ShieldAlert,
	Stamp,
	Ticket,
	User,
	Users,
	Wallet,
	Wrench,
};

/**
 * Renders a Lucide icon from its name string.
 * Returns null and a console warning if the name is not found.
 */
export function DynamicLucideIcon({
	name,
	className,
	size,
}: {
	name: string;
	className?: string;
	size?: number;
}) {
	const IconComponent = LUCIDE_ICON_MAP[name];
	if (!IconComponent) {
		return <span className={className}>{name}</span>;
	}
	return <IconComponent className={className} size={size} />;
}

/**
 * Returns the Lucide icon component for a given name string.
 * Falls back to a default icon if not found.
 */
export function getLucideIcon(name: string, fallback?: LucideIcon): LucideIcon {
	return LUCIDE_ICON_MAP[name] ?? fallback ?? FileText;
}
