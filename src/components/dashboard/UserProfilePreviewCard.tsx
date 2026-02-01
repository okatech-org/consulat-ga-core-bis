"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ChevronRight, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { ProfileViewSheet } from "@/components/dashboard/ProfileViewSheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfilePreviewCardProps {
	userId: Id<"users">;
}

/**
 * Self-contained component that displays a user profile preview card
 * Fetches profile data internally and handles the sheet modal
 */
export function UserProfilePreviewCard({
	userId,
}: UserProfilePreviewCardProps) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const profile = useQuery(api.functions.profiles.getByUserId, { userId });

	// Loading state
	if (profile === undefined) {
		return (
			<Card className="overflow-hidden py-0">
				<div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-14 w-14 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-20" />
						</div>
					</div>
				</div>
				<CardContent className="p-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</CardContent>
			</Card>
		);
	}

	// No profile state
	if (!profile) {
		return (
			<Card className="overflow-hidden py-0">
				<div className="bg-muted/50 p-6 text-center">
					<User className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
					<p className="text-sm text-muted-foreground">Profil non renseigné</p>
				</div>
			</Card>
		);
	}

	const initials =
		(profile.identity?.firstName?.[0] || "") +
		(profile.identity?.lastName?.[0] || "");
	const fullName =
		[profile.identity?.firstName, profile.identity?.lastName]
			.filter(Boolean)
			.join(" ") || "Nom inconnu";

	return (
		<>
			<Card className="overflow-hidden py-0">
				{/* Profile Header with gradient */}
				<div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
					<div className="flex items-center gap-3">
						<Avatar className="h-14 w-14 border-2 border-background shadow-sm">
							<AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
								{initials || "?"}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-base truncate">{fullName}</h3>
							<Badge
								variant={
									profile.completionScore >= 80 ? "default" : "secondary"
								}
								className="mt-1"
							>
								Profil {profile.completionScore}%
							</Badge>
						</div>
					</div>
				</div>

				{/* Contact Info Preview */}
				<CardContent className="p-4 space-y-2">
					{profile.contacts?.email && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Mail className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">{profile.contacts.email}</span>
						</div>
					)}
					{profile.contacts?.phone && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Phone className="h-3.5 w-3.5 shrink-0" />
							<span>{profile.contacts.phone}</span>
						</div>
					)}
				</CardContent>

				{/* View Full Profile Button */}
				<CardFooter className="p-0 border-t">
					<Button
						variant="ghost"
						className="w-full h-11 rounded-none justify-between text-sm font-medium hover:bg-muted/50"
						onClick={() => setSheetOpen(true)}
					>
						Voir le profil complet
						<ChevronRight className="h-4 w-4" />
					</Button>
				</CardFooter>
			</Card>

			<ProfileViewSheet
				userId={userId}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</>
	);
}
