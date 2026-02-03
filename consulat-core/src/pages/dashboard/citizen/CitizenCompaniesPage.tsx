import { useEffect, useState } from 'react';
import { Company } from '@/types/company';
import { companyService } from '@/services/company-service';
import { CompanyList } from '@/components/companies/CompanyList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CitizenCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await companyService.getAll();
                setCompanies(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    // Filter for "My Companies" (mock logic: ownerId = 'user-current')
    const myCompanies = companies.filter(c => c.ownerId === 'user-current');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Entreprises</h1>
                    <p className="text-muted-foreground">Réseau entrepreneurial et gestion de vos entreprises.</p>
                </div>
                <Link to="/companies/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Créer une entreprise
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="network" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="network">Réseau Global</TabsTrigger>
                    <TabsTrigger value="mine">Mes Entreprises</TabsTrigger>
                </TabsList>

                <TabsContent value="network" className="mt-6">
                    <CompanyList companies={companies} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="mine" className="mt-6">
                    {myCompanies.length > 0 ? (
                        <CompanyList companies={myCompanies} isLoading={isLoading} />
                    ) : (
                        <div className="text-center py-12 glass-card rounded-xl">
                            <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé d'entreprise.</p>
                            <Link to="/companies/new">
                                <Button variant="outline">Créer ma première entreprise</Button>
                            </Link>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
