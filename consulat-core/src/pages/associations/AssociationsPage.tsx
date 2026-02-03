import { useEffect, useState } from 'react';
import { Association } from '@/types/association';
import { associationService } from '@/services/association-service';
import { AssociationList } from '@/components/associations/AssociationList';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssociationsPage() {
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const data = await associationService.getAll();
                setAssociations(data);
            } catch (error) {
                console.error('Failed to fetch associations', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssociations();
    }, []);

    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Users className="w-8 h-8 text-primary" />
                            Associations
                        </h1>
                        <p className="text-muted-foreground">
                            Découvrez et rejoignez les associations de la communauté.
                        </p>
                    </div>

                    <Link to="/associations/new">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter mon association
                        </Button>
                    </Link>
                </div>

                <AssociationList associations={associations} isLoading={isLoading} />
            </div>
        </div>
    );
}
