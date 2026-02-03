import { Association } from '@/types/association';
import { AssociationCard } from './AssociationCard';

interface AssociationListProps {
    associations: Association[];
    isLoading?: boolean;
}

export function AssociationList({ associations, isLoading }: AssociationListProps) {
    if (isLoading) {
        return <div className="text-center py-10">Chargement...</div>;
    }

    if (associations.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Aucune association trouvée.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associations.map((association) => (
                <AssociationCard key={association.id} association={association} />
            ))}
        </div>
    );
}
