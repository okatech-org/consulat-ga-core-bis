/**
 * CV Service - Mode Mock
 * 
 * Ce service gère les CV des citoyens.
 * Utilise les données mockées pour la démo.
 */

import { CV } from '@/types/cv';
import { MOCK_CV } from '@/data/mock-cv';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class CVService {
    private mockCV: CV = { ...MOCK_CV };

    /**
     * Get CV for current user
     */
    async getMyCV(): Promise<CV> {
        await delay(500);
        return this.mockCV;
    }

    /**
     * Update CV for current user
     */
    async updateCV(data: Partial<CV>): Promise<CV> {
        await delay(500);
        this.mockCV = {
            ...this.mockCV,
            ...data,
            updatedAt: new Date().toISOString()
        };
        return this.mockCV;
    }
}

export const cvService = new CVService();
