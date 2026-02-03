import { useEffect, useState } from 'react';
import { Association, AssociationMember, AssociationRole } from '@/types/association';
import { associationService } from '@/services/association-service';
import { AssociationList } from '@/components/associations/AssociationList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Settings, Phone, CreditCard as CardIcon, Search, QrCode, UserPlus, Check, Clock, Send, ChevronRight, Calendar, Megaphone, Shield, Trash2, Edit, ImageIcon, Mail, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Search method types
type SearchMethod = 'phone' | 'consular';

// Management tab types  
type ManagementTab = 'members' | 'publications' | 'settings';

// Publication type
interface Publication {
    id: string;
    type: 'event' | 'news';
    title: string;
    content: string;
    date: string;
    eventDate?: string;
}

// Mock: Search user by different methods
const mockSearchUser = async (method: SearchMethod, query: string): Promise<{ found: boolean; user?: { id: string; name: string; email: string; phone: string; consularId: string } }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (query.length >= 3) {
        return {
            found: true,
            user: {
                id: `user-${Date.now()}`,
                name: method === 'phone' ? 'Utilisateur Trouvé' : 'Citoyen Gabonais',
                email: 'user.trouve@email.com',
                phone: method === 'phone' ? query : '+241 77 00 00 00',
                consularId: method === 'consular' ? query : 'GAB-2024-123456',
            }
        };
    }
    return { found: false };
};

// Generate iBoîte address from association name
const generateIBoiteAddress = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '@associations.consulat.ga';
};

export default function CitizenAssociationsPage() {
    const navigate = useNavigate();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
    const [managementTab, setManagementTab] = useState<ManagementTab>('members');

    // Search state for member invitation
    const [searchMethod, setSearchMethod] = useState<SearchMethod>('phone');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<{ id: string; name: string; email: string; phone: string; consularId: string } | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    // Mock members for selected association
    const [members, setMembers] = useState<AssociationMember[]>([
        { id: 'm1', userId: 'user-current', userName: 'Jean Dupont', userEmail: 'jean.dupont@email.com', role: AssociationRole.PRESIDENT, invitationStatus: 'accepted', invitedAt: '2024-01-01' },
        { id: 'm2', userId: 'user-2', userName: 'Marie Koumba', userEmail: 'marie.k@email.com', role: AssociationRole.SECRETARY, invitationStatus: 'accepted', invitedAt: '2024-01-15' },
        { id: 'm3', userId: 'user-3', userName: 'Pierre Ndong', userEmail: 'p.ndong@email.com', role: AssociationRole.MEMBER, invitationStatus: 'pending', invitedAt: '2024-02-01' },
    ]);

    // Publications state
    const [publications, setPublications] = useState<Publication[]>([
        { id: 'p1', type: 'event', title: 'Assemblée Générale 2024', content: 'Réunion annuelle de tous les membres', date: '2024-02-15', eventDate: '2024-03-15' },
        { id: 'p2', type: 'news', title: 'Nouveau partenariat signé', content: 'Nous sommes fiers d\'annoncer notre partenariat avec...', date: '2024-02-10' },
    ]);
    const [newPublication, setNewPublication] = useState({ type: 'news' as 'event' | 'news', title: '', content: '', eventDate: '' });

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const data = await associationService.getAll();
                setAssociations(data);
                const owned = data.filter(a => a.ownerId === 'user-current');
                if (owned.length > 0) setSelectedAssociation(owned[0]);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssociations();
    }, []);

    const myAssociations = associations.filter(a => a.ownerId === 'user-current');
    const acceptedMembers = members.filter(m => m.invitationStatus === 'accepted');
    const pendingMembers = members.filter(m => m.invitationStatus === 'pending');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setFoundUser(null);
        const result = await mockSearchUser(searchMethod, searchQuery);
        if (result.found && result.user) {
            setFoundUser(result.user);
        } else {
            toast.error('Utilisateur non trouvé');
        }
        setIsSearching(false);
    };

    const handleInviteMember = async () => {
        if (!foundUser) return;
        setIsInviting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newMember: AssociationMember = {
            id: `m${Date.now()}`,
            userId: foundUser.id,
            userName: foundUser.name,
            userEmail: foundUser.email,
            role: AssociationRole.MEMBER,
            invitationStatus: 'pending',
            invitedAt: new Date().toISOString(),
        };
        setMembers([...members, newMember]);
        setFoundUser(null);
        setSearchQuery('');
        setIsInviting(false);
        toast.success('Invitation envoyée !');
    };

    const handlePromoteToAdmin = (memberId: string) => {
        setMembers(members.map(m => m.id === memberId ? { ...m, role: AssociationRole.VICE_PRESIDENT } : m));
        toast.success('Membre promu administrateur');
    };

    const handleAddPublication = () => {
        if (!newPublication.title.trim()) return;
        const pub: Publication = {
            id: `pub-${Date.now()}`,
            type: newPublication.type,
            title: newPublication.title,
            content: newPublication.content,
            date: new Date().toISOString().split('T')[0],
            eventDate: newPublication.type === 'event' ? newPublication.eventDate : undefined,
        };
        setPublications([pub, ...publications]);
        setNewPublication({ type: 'news', title: '', content: '', eventDate: '' });
        toast.success('Publication ajoutée !');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Associations</h1>
                    <p className="text-muted-foreground">Réseau associatif et gestion de vos associations.</p>
                </div>
                <Link to="/associations/new">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Créer une association</Button>
                </Link>
            </div>

            <Tabs defaultValue="mine" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="mine">Mes Associations</TabsTrigger>
                    <TabsTrigger value="network">Réseau Global</TabsTrigger>
                </TabsList>

                <TabsContent value="mine" className="mt-6">
                    {myAssociations.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Left: Association List */}
                            <div className="lg:col-span-1 space-y-3">
                                <p className="text-sm font-semibold text-muted-foreground uppercase">Vos associations</p>
                                {myAssociations.map(asso => (
                                    <button
                                        key={asso.id}
                                        onClick={() => { setSelectedAssociation(asso); setManagementTab('members'); }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedAssociation?.id === asso.id ? 'glass-card ring-2 ring-primary' : 'glass-card hover:ring-1 hover:ring-primary/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl">🤝</div>
                                            <div>
                                                <p className="font-semibold text-sm">{asso.name}</p>
                                                <p className="text-xs text-muted-foreground">{asso.associationType}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>

                            {/* Right: Management Panel */}
                            <div className="lg:col-span-3">
                                {selectedAssociation ? (
                                    <div className="glass-card rounded-xl overflow-hidden">
                                        {/* Header with iBoîte address */}
                                        <div className="p-6 border-b border-border/50">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">🤝</div>
                                                    <div>
                                                        <h2 className="text-xl font-bold">{selectedAssociation.name}</h2>
                                                        <p className="text-sm text-muted-foreground">{selectedAssociation.associationType}</p>
                                                    </div>
                                                </div>
                                                {/* Quick Actions */}
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/icarte')} className="gap-2">
                                                        <CardIcon className="w-4 h-4" /> Personaliser la carte
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* iBoîte Address */}
                                            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Adresse iBoîte de l'association</p>
                                                        <p className="font-mono text-sm font-semibold text-blue-500">{generateIBoiteAddress(selectedAssociation.name)}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/iboite')} className="gap-2">
                                                    <ExternalLink className="w-4 h-4" /> Ouvrir iBoîte
                                                </Button>
                                            </div>

                                            {/* Sub-tabs */}
                                            <div className="flex gap-2 mt-4">
                                                {[
                                                    { id: 'members', label: 'Membres', icon: Users },
                                                    { id: 'publications', label: 'Publications', icon: Megaphone },
                                                    { id: 'settings', label: 'Paramètres', icon: Settings },
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setManagementTab(tab.id as ManagementTab)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${managementTab === tab.id ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                                                    >
                                                        <tab.icon className="w-4 h-4" /> {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* MEMBERS TAB */}
                                            {managementTab === 'members' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold">Gestion des Membres</h3>
                                                        <span className="text-sm text-muted-foreground">{acceptedMembers.length} membres actifs</span>
                                                    </div>

                                                    {/* Search */}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setSearchMethod('phone'); setFoundUser(null); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${searchMethod === 'phone' ? 'bg-primary text-white' : 'bg-muted/50'}`}>
                                                            <Phone className="w-3.5 h-3.5" /> Téléphone
                                                        </button>
                                                        <button onClick={() => { setSearchMethod('consular'); setFoundUser(null); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${searchMethod === 'consular' ? 'bg-primary text-white' : 'bg-muted/50'}`}>
                                                            <CardIcon className="w-3.5 h-3.5" /> ID Consulaire
                                                        </button>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input placeholder={searchMethod === 'phone' ? '+241 77 00 00 00' : 'GAB-2024-XXXXXX'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                                            {searchMethod === 'consular' && <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"><QrCode className="w-4 h-4 text-muted-foreground" /></button>}
                                                        </div>
                                                        <Button onClick={handleSearch} disabled={isSearching} variant="secondary">
                                                            {isSearching ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                                        </Button>
                                                    </div>

                                                    {foundUser && (
                                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                                                            <div>
                                                                <p className="font-semibold">{foundUser.name}</p>
                                                                <p className="text-xs text-muted-foreground">{foundUser.email} • ID: {foundUser.consularId}</p>
                                                            </div>
                                                            <Button onClick={handleInviteMember} disabled={isInviting} size="sm">
                                                                {isInviting ? <Clock className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Inviter</>}
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {pendingMembers.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Invitations en attente</p>
                                                            {pendingMembers.map(member => (
                                                                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                                                    <div className="flex items-center gap-2"><Send className="w-3 h-3" /><span className="text-sm">{member.userName}</span></div>
                                                                    <span className="text-xs">En attente</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Membres actifs</p>
                                                        {acceptedMembers.map(member => (
                                                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-green-500" /></div>
                                                                    <div>
                                                                        <p className="font-medium text-sm">{member.userName}</p>
                                                                        <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${member.role === AssociationRole.PRESIDENT ? 'bg-primary/20 text-primary' : member.role === AssociationRole.VICE_PRESIDENT ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                                                                        {member.role === AssociationRole.PRESIDENT ? 'PRÉSIDENT' : member.role === AssociationRole.VICE_PRESIDENT ? 'ADMIN' : member.role}
                                                                    </span>
                                                                    {member.role === AssociationRole.MEMBER && (
                                                                        <Button variant="ghost" size="sm" onClick={() => handlePromoteToAdmin(member.id)} title="Promouvoir admin">
                                                                            <Shield className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* PUBLICATIONS TAB */}
                                            {managementTab === 'publications' && (
                                                <div className="space-y-6">
                                                    <h3 className="font-semibold">Publications de l'association</h3>

                                                    <div className="glass-card p-4 rounded-xl space-y-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setNewPublication({ ...newPublication, type: 'news' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${newPublication.type === 'news' ? 'bg-primary text-white' : 'bg-muted/50'}`}>
                                                                <Megaphone className="w-3.5 h-3.5" /> Actualité
                                                            </button>
                                                            <button onClick={() => setNewPublication({ ...newPublication, type: 'event' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${newPublication.type === 'event' ? 'bg-primary text-white' : 'bg-muted/50'}`}>
                                                                <Calendar className="w-3.5 h-3.5" /> Événement
                                                            </button>
                                                        </div>
                                                        <Input placeholder="Titre de la publication" value={newPublication.title} onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })} />
                                                        <Textarea placeholder="Contenu..." value={newPublication.content} onChange={(e) => setNewPublication({ ...newPublication, content: e.target.value })} className="h-20" />
                                                        {newPublication.type === 'event' && (
                                                            <Input type="date" value={newPublication.eventDate} onChange={(e) => setNewPublication({ ...newPublication, eventDate: e.target.value })} />
                                                        )}
                                                        <Button onClick={handleAddPublication} disabled={!newPublication.title.trim()}>Publier</Button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {publications.map(pub => (
                                                            <div key={pub.id} className="p-4 rounded-xl bg-muted/30 flex items-start justify-between">
                                                                <div className="flex gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pub.type === 'event' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                                                                        {pub.type === 'event' ? <Calendar className="w-5 h-5 text-blue-500" /> : <Megaphone className="w-5 h-5 text-purple-500" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">{pub.title}</p>
                                                                        <p className="text-sm text-muted-foreground line-clamp-1">{pub.content}</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {pub.type === 'event' && pub.eventDate && `📅 ${new Date(pub.eventDate).toLocaleDateString('fr-FR')} • `}
                                                                            Publié le {new Date(pub.date).toLocaleDateString('fr-FR')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="sm" onClick={() => setPublications(publications.filter(p => p.id !== pub.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* SETTINGS TAB */}
                                            {managementTab === 'settings' && (
                                                <div className="space-y-6">
                                                    <h3 className="font-semibold">Paramètres de l'association</h3>
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                                                            <p className="font-medium">Informations générales</p>
                                                            <p className="text-sm text-muted-foreground">Modifiez le nom, la description et les coordonnées.</p>
                                                            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" /> Modifier</Button>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                                                            <p className="font-medium">Logo et médias</p>
                                                            <p className="text-sm text-muted-foreground">Ajoutez ou modifiez le logo de l'association.</p>
                                                            <Button variant="outline" size="sm"><ImageIcon className="w-4 h-4 mr-2" /> Changer le logo</Button>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-red-500/10 space-y-2">
                                                            <p className="font-medium text-red-500">Zone de danger</p>
                                                            <p className="text-sm text-muted-foreground">Supprimer l'association de manière définitive.</p>
                                                            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-card p-12 rounded-xl text-center">
                                        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-muted-foreground">Sélectionnez une association</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 glass-card rounded-xl">
                            <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé d'association.</p>
                            <Link to="/associations/new"><Button variant="outline">Créer ma première association</Button></Link>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="network" className="mt-6">
                    <AssociationList associations={associations} isLoading={isLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
