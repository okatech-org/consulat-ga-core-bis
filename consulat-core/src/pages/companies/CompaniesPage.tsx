import { useEffect, useState } from 'react';
import { Company } from '@/types/company';
import { companyService } from '@/services/company-service';
import { CompanyList } from '@/components/companies/CompanyList';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await companyService.getAll();
                setCompanies(data);
            } catch (error) {
                console.error('Failed to fetch companies', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Briefcase className="w-8 h-8 text-primary" />
                            Entreprises
                        </h1>
                        <p className="text-muted-foreground">
                            Annuaire des entreprises de la diaspora gabonaise.
                        </p>
                    </div>

                    <Link to="/companies/new">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter mon entreprise
                        </Button>
                    </Link>
                </div>

                <CompanyList companies={companies} isLoading={isLoading} />
            </div>
        </div>
    );
}
