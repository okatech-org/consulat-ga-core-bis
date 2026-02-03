import { Company, EntityStatus } from '@/types/company';
import { MOCK_COMPANIES } from '@/data/mock-companies';

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class CompanyService {
    private companies: Company[] = [...MOCK_COMPANIES];

    async getAll(status?: EntityStatus): Promise<Company[]> {
        await delay(500);
        if (status) {
            return this.companies.filter(c => c.status === status);
        }
        return this.companies;
    }

    async getById(id: string): Promise<Company | undefined> {
        await delay(300);
        return this.companies.find(c => c.id === id);
    }

    async create(company: Omit<Company, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Company> {
        await delay(800);
        const newCompany: Company = {
            ...company,
            id: `comp-${Date.now()}`,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.companies.push(newCompany);
        return newCompany;
    }

    async update(id: string, data: Partial<Company>): Promise<Company> {
        await delay(500);
        const index = this.companies.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Company not found');

        this.companies[index] = {
            ...this.companies[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return this.companies[index];
    }

    async validate(id: string, validatorId: string): Promise<Company> {
        return this.update(id, {
            status: 'APPROVED',
            validatedAt: new Date().toISOString(),
            validatedById: validatorId
        });
    }

    async reject(id: string, validatorId: string, reason: string): Promise<Company> {
        return this.update(id, {
            status: 'REJECTED',
            rejectionReason: reason,
            validatedAt: new Date().toISOString(),
            validatedById: validatorId
        });
    }
}

export const companyService = new CompanyService();
