import { Company } from '@/types/company';
import { MapPin, Briefcase } from 'lucide-react';
import { EntityStatusBadge } from '@/components/shared/EntityStatusBadge';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
    company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
    return (
        <Link to={`/companies/${company.id}`} className="block">
            <div className="glass-card p-6 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-primary/10">
                        {/* Placeholder for logo if not present */}
                        🏢
                    </div>
                    <EntityStatusBadge status={company.status} />
                </div>

                <h3 className="font-bold text-lg mb-1">{company.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                    {company.companyType} • {company.activitySector}
                </p>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                    {company.shortDescription || company.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.address.city}, {company.address.country}
                    </div>
                </div>
            </div>
        </Link>
    );
}
