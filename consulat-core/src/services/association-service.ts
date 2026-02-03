import { Association } from '@/types/association';
import { EntityStatus } from '@/types/company';
import { MOCK_ASSOCIATIONS } from '@/data/mock-associations';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AssociationService {
    private associations: Association[] = [...MOCK_ASSOCIATIONS];

    async getAll(status?: EntityStatus): Promise<Association[]> {
        await delay(500);
        if (status) {
            return this.associations.filter(a => a.status === status);
        }
        return this.associations;
    }

    async getById(id: string): Promise<Association | undefined> {
        await delay(300);
        return this.associations.find(a => a.id === id);
    }

    async create(association: Omit<Association, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Association> {
        await delay(800);
        const newAssociation: Association = {
            ...association,
            id: `asso-${Date.now()}`,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.associations.push(newAssociation);
        return newAssociation;
    }

    async update(id: string, data: Partial<Association>): Promise<Association> {
        await delay(500);
        const index = this.associations.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Association not found');

        this.associations[index] = {
            ...this.associations[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return this.associations[index];
    }

    async validate(id: string, validatorId: string): Promise<Association> {
        return this.update(id, {
            status: 'APPROVED',
            validatedAt: new Date().toISOString(),
            validatedById: validatorId
        });
    }

    async reject(id: string, validatorId: string, reason: string): Promise<Association> {
        return this.update(id, {
            status: 'REJECTED',
            rejectionReason: reason,
            validatedAt: new Date().toISOString(),
            validatedById: validatorId
        });
    }
}

export const associationService = new AssociationService();
