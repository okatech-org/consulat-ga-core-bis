import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Association } from '@/types/association';
import { associationService } from '@/services/association-service';
import { Button } from '@/components/ui/button';
import { EntityStatusBadge } from '@/components/shared/EntityStatusBadge';
import { MapPin, Globe, Phone, Mail, ArrowLeft, Users, Calendar, Heart, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AssociationDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [association, setAssociation] = useState<Association | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequestingJoin, setIsRequestingJoin] = useState(false);

    useEffect(() => {
        const fetchAssociation = async () => {
            if (!id) return;
            try {
                const data = await associationService.getById(id);
                setAssociation(data || null);
            } catch (error) {
                console.error('Failed to fetch association', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssociation();
    }, [id]);

    const handleRequestJoin = async () => {
        setIsRequestingJoin(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRequestingJoin(false);
        toast.success('Demande envoyée !', { description: 'Le président de l\'association recevra votre demande d\'adhésion.' });
    };

    const handleDonate = () => {
        toast.info('Fonctionnalité à venir', { description: 'Le système de don sera bientôt disponible.' });
    };

    if (isLoading) return <div className="container mx-auto py-8">Chargement...</div>;
    if (!association) return <div className="container mx-auto py-8">Association non trouvée</div>;

    // Mock member count from accepted invitations
    const memberCount = association.memberCount || 12;

    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6 max-w-4xl mx-auto">
                <Link to="/associations">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Retour aux associations
                    </Button>
                </Link>

                <div className="glass-card p-8 rounded-xl space-y-6">
                    {/* Header with Join/Donate Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl bg-purple-500/10">
                                🤝
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{association.name}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <span className="font-semibold">{association.associationType}</span>
                                    <EntityStatusBadge status={association.status} />
                                </div>
                            </div>
                        </div>

                        {/* Public Actions */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                onClick={handleRequestJoin}
                                disabled={isRequestingJoin}
                                className="flex-1 md:flex-none gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                {isRequestingJoin ? 'Envoi...' : 'Demander à adhérer'}
                            </Button>
                            <Button
                                onClick={handleDonate}
                                variant="outline"
                                className="flex-1 md:flex-none gap-2"
                            >
                                <Heart className="w-4 h-4" />
                                Faire un don
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">À propos</h2>
                                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                    {association.description}
                                </p>
                            </div>

                            {association.objectives && (
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <h3 className="font-semibold mb-2">Objectifs</h3>
                                    <p className="text-sm text-muted-foreground">{association.objectives}</p>
                                </div>
                            )}

                            {/* Why Join Section */}
                            <div className="glass-card p-6 rounded-xl space-y-4">
                                <h3 className="font-semibold">Pourquoi rejoindre ?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">✓</span>
                                        <span>Participez aux activités et événements de l'association</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">✓</span>
                                        <span>Recevez votre carte de membre numérique dans votre porte-cartes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">✓</span>
                                        <span>Contribuez à la vie associative de la diaspora gabonaise</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="glass-card p-6 rounded-xl space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Coordonnées
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <div>{association.address.street}</div>
                                            <div>{association.address.postalCode} {association.address.city}</div>
                                            <div>{association.address.country}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${association.email}`} className="hover:underline text-primary">
                                            {association.email}
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <a href={`tel:${association.phone}`} className="hover:underline">
                                            {association.phone}
                                        </a>
                                    </div>

                                    {association.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-muted-foreground" />
                                            <a href={association.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                Site Web
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-3 rounded-lg text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Membres</div>
                                    <div className="font-bold flex items-center justify-center gap-1 text-primary">
                                        <Users className="w-3 h-3" /> {memberCount}
                                    </div>
                                </div>
                                {association.foundingYear && (
                                    <div className="glass-card p-3 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Création</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            <Calendar className="w-3 h-3" /> {association.foundingYear}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Donate CTA */}
                            <div className="glass-card p-4 rounded-xl text-center space-y-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
                                <Heart className="w-8 h-8 text-primary mx-auto" />
                                <p className="text-sm font-semibold">Soutenez cette association</p>
                                <p className="text-xs text-muted-foreground">Votre don aide à financer nos activités</p>
                                <Button onClick={handleDonate} variant="secondary" size="sm" className="w-full gap-2">
                                    <Heart className="w-3 h-3" /> Faire un don
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
