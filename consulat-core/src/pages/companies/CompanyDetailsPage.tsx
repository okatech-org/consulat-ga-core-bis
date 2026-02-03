import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Company } from '@/types/company';
import { companyService } from '@/services/company-service';
import { Button } from '@/components/ui/button';
import { EntityStatusBadge } from '@/components/shared/EntityStatusBadge';
import { MapPin, Globe, Phone, Mail, ArrowLeft, Briefcase } from 'lucide-react';

export default function CompanyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;
            try {
                const data = await companyService.getById(id);
                setCompany(data || null);
            } catch (error) {
                console.error('Failed to fetch company', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    if (isLoading) return <div className="container mx-auto py-8">Chargement...</div>;
    if (!company) return <div className="container mx-auto py-8">Entreprise non trouvée</div>;

    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6 max-w-4xl mx-auto">
                <Link to="/companies">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Retour aux entreprises
                    </Button>
                </Link>

                <div className="neu-raised p-8 rounded-xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="neu-inset w-20 h-20 rounded-xl flex items-center justify-center text-4xl">
                                🏢
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{company.name}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <span className="font-semibold">{company.companyType}</span>
                                    <span>•</span>
                                    <span>{company.activitySector}</span>
                                </div>
                            </div>
                        </div>
                        <EntityStatusBadge status={company.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">À propos</h2>
                                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                    {company.description}
                                </p>
                            </div>

                            {company.legalName && (
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <span className="text-sm font-semibold text-muted-foreground">Raison Sociale:</span>
                                    <span className="ml-2 font-medium">{company.legalName}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="neu-inset p-6 rounded-xl space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Coordonnées
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <div>{company.address.street}</div>
                                            <div>{company.address.postalCode} {company.address.city}</div>
                                            <div>{company.address.country}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${company.email}`} className="hover:underline text-primary">
                                            {company.email}
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <a href={`tel:${company.phone}`} className="hover:underline">
                                            {company.phone}
                                        </a>
                                    </div>

                                    {company.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-muted-foreground" />
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                Site Web
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {company.siret && (
                                <div className="text-xs text-muted-foreground text-center">
                                    SIRET: {company.siret}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
