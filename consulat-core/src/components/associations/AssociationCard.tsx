import { Association } from '@/types/association';
import { MapPin, Users } from 'lucide-react';
import { EntityStatusBadge } from '@/components/shared/EntityStatusBadge';
import { Link } from 'react-router-dom';

interface AssociationCardProps {
    association: Association;
}

export function AssociationCard({ association }: AssociationCardProps) {
    return (
        <Link to={`/associations/${association.id}`} className="block">
            <div className="glass-card p-6 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-purple-500/10">
                        🤝
                    </div>
                    <EntityStatusBadge status={association.status} />
                </div>

                <h3 className="font-bold text-lg mb-1">{association.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                    {association.associationType}
                </p>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                    {association.shortDescription || association.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {association.address.city}
                    </div>
                    {association.memberCount && (
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {association.memberCount} membres
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
