import { useState } from "react";
import { Entity, COUNTRY_FLAGS } from "@/types/entity";
import { getUsersByEntity } from "@/data/mock-users";
import { getDemoAccountsForEntity } from "@/utils/demo-accounts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, User, Briefcase } from "lucide-react";
import { DemoUserCard } from "./DemoUserCard";
import { motion, AnimatePresence } from "framer-motion";

interface EntityCardProps {
    entity: Entity;
}

export function EntityCard({ entity }: EntityCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const agents = getUsersByEntity(entity.id)
        .filter(u => u.role !== 'CITIZEN' && u.role !== 'ADMIN')
        .sort((a, b) => (a.hierarchyLevel || 99) - (b.hierarchyLevel || 99));
    const demoAccounts = getDemoAccountsForEntity(entity);

    return (
        <Card className={`transition-all duration-300 border-l-4 ${isExpanded ? 'ring-2 ring-primary' : ''}`} style={{ borderLeftColor: '#00563F' }}>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl shadow-sm rounded-full bg-white p-1">
                            {COUNTRY_FLAGS[entity.metadata?.countryCode || ''] || '🌍'}
                        </span>
                        <div>
                            <CardTitle className="text-xl text-primary">{entity.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>📍 {entity.metadata?.city}, {entity.metadata?.country}</span>
                                <Badge variant="outline" className="text-xs">
                                    {entity.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <CardContent className="pt-0 pb-6 space-y-6">

                            {/* Agents Section */}
                            {agents.length > 0 && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        PERSONNEL CONSULAIRE ({agents.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {agents.map(agent => (
                                            <DemoUserCard key={agent.id} user={agent} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Demo Accounts Section */}
                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-500 mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    COMPTES USAGERS DÉMO (5)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {demoAccounts.map(account => (
                                        <DemoUserCard key={account.id} user={account} />
                                    ))}
                                </div>
                            </div>

                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
