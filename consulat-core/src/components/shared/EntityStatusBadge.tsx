import { EntityStatus } from '@/types/company';

interface EntityStatusBadgeProps {
    status: EntityStatus;
}

export function EntityStatusBadge({ status }: EntityStatusBadgeProps) {
    const styles = {
        APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    const labels = {
        APPROVED: 'Validé',
        PENDING: 'En attente',
        REJECTED: 'Rejeté'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
