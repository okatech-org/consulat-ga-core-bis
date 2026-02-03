import { Company } from '@/types/company';
import { CompanyCard } from './CompanyCard';

interface CompanyListProps {
    companies: Company[];
    isLoading?: boolean;
}

export function CompanyList({ companies, isLoading }: CompanyListProps) {
    if (isLoading) {
        return <div className="text-center py-10">Chargement...</div>;
    }

    if (companies.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Aucune entreprise trouvée.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
}
