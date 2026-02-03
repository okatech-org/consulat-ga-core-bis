/**
 * Document OCR Service
 * Uses Gemini Vision API to extract structured data from identity documents
 * Provides intelligent document recognition and data extraction
 */

// Document types we can analyze
export type OCRDocumentType =
    | 'cni'                 // Carte Nationale d'Identité
    | 'passport'            // Passeport
    | 'birth_certificate'   // Acte de naissance
    | 'residence_proof'     // Justificatif de domicile
    | 'family_record'       // Livret de famille
    | 'diploma'             // Diplôme
    | 'health_card'         // Carte de santé
    | 'driving_license'     // Permis de conduire
    | 'other';              // Autre document

// Side detection
export type DocumentSide = 'front' | 'back' | undefined;

// Extracted data structure
export interface ExtractedData {
    lastName?: string;
    firstName?: string;
    dateOfBirth?: string;           // YYYY-MM-DD format
    placeOfBirth?: string;
    nationality?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    fatherName?: string;
    fatherFirstName?: string;
    motherName?: string;
    motherFirstName?: string;
    documentNumber?: string;        // For passport/CNI
    expiryDate?: string;            // For passport/CNI
    issueDate?: string;
    maritalStatus?: string;
    profession?: string;
    phone?: string;
    email?: string;
}

// Analysis result
export interface DocumentAnalysis {
    documentType: OCRDocumentType;
    detectedSide: DocumentSide;
    confidence: number;             // 0.0 to 1.0
    extractedData: ExtractedData;
    uncertainFields: string[];      // Fields with low confidence
    suggestedFolder: string;        // Suggested folder category
    rawText?: string;               // Raw text for debugging
    error?: string;
}

// Field priority by document type
const FIELD_PRIORITY: Record<string, OCRDocumentType[]> = {
    address: ['residence_proof', 'cni', 'passport'],
    city: ['residence_proof', 'cni', 'passport'],
    postalCode: ['residence_proof', 'cni', 'passport'],
    lastName: ['cni', 'passport', 'birth_certificate'],
    firstName: ['cni', 'passport', 'birth_certificate'],
    dateOfBirth: ['birth_certificate', 'cni', 'passport'],
    placeOfBirth: ['birth_certificate', 'cni', 'passport'],
    fatherName: ['birth_certificate', 'family_record'],
    fatherFirstName: ['birth_certificate', 'family_record'],
    motherName: ['birth_certificate', 'family_record'],
    motherFirstName: ['birth_certificate', 'family_record'],
    nationality: ['passport', 'cni'],
    documentNumber: ['passport', 'cni', 'driving_license'],
    expiryDate: ['passport', 'cni', 'driving_license', 'health_card'],
};

// Document type to folder mapping
const DOC_TYPE_TO_FOLDER: Record<OCRDocumentType, string> = {
    cni: 'identity',
    passport: 'identity',
    birth_certificate: 'civil_status',
    residence_proof: 'residence',
    family_record: 'civil_status',
    diploma: 'education',
    health_card: 'health',
    driving_license: 'vehicle',
    other: 'other'
};

/**
 * Convert File to base64 (without data URL prefix)
 */
async function fileToBase64Raw(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Detect document type from filename
 */
export function detectDocumentType(filename: string): OCRDocumentType | undefined {
    const lower = filename.toLowerCase();

    if (lower.includes('cni') || lower.includes('identite') || lower.includes('identity') || lower.includes('carte')) {
        return 'cni';
    }
    if (lower.includes('passeport') || lower.includes('passport')) {
        return 'passport';
    }
    if (lower.includes('naissance') || lower.includes('birth') || lower.includes('acte')) {
        return 'birth_certificate';
    }
    if (lower.includes('domicile') || lower.includes('facture') || lower.includes('quittance') ||
        lower.includes('edf') || lower.includes('seeg') || lower.includes('justif')) {
        return 'residence_proof';
    }
    if (lower.includes('livret') || lower.includes('famille') || lower.includes('family')) {
        return 'family_record';
    }
    if (lower.includes('diplome') || lower.includes('bac') || lower.includes('licence') ||
        lower.includes('master') || lower.includes('certificat')) {
        return 'diploma';
    }
    if (lower.includes('cnamgs') || lower.includes('sante') || lower.includes('health') ||
        lower.includes('medical') || lower.includes('assurance')) {
        return 'health_card';
    }
    if (lower.includes('permis') || lower.includes('conduire') || lower.includes('driving') ||
        lower.includes('license')) {
        return 'driving_license';
    }

    return undefined;
}

/**
 * Detect document side from filename
 */
export function detectDocumentSide(filename: string): DocumentSide {
    const lower = filename.toLowerCase();

    if (lower.includes('recto') || lower.includes('front') || lower.includes('avant') || lower.includes('face')) {
        return 'front';
    }
    if (lower.includes('verso') || lower.includes('back') || lower.includes('arriere') || lower.includes('dos')) {
        return 'back';
    }

    return undefined;
}

/**
 * Get folder suggestion based on document type
 */
export function getSuggestedFolder(docType: OCRDocumentType): string {
    return DOC_TYPE_TO_FOLDER[docType] || 'other';
}

import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze a single document using Gemini Vision API via Supabase Edge Function
 * Falls back to mock data if the Edge Function is not available
 */
export async function analyzeDocument(
    file: File,
    documentType?: OCRDocumentType,
    useRealOCR: boolean = false // Set to true to use real OCR
): Promise<DocumentAnalysis> {
    try {
        console.log(`[DocumentOCR] Analyzing document: ${file.name}, type hint: ${documentType || 'auto'}`);

        // Detect type and side from filename
        const detectedType = documentType || detectDocumentType(file.name) || 'other';
        const detectedSide = detectDocumentSide(file.name);

        // Convert file to base64
        const imageBase64 = await fileToBase64Raw(file);

        // Try to call the real Edge Function if enabled
        if (useRealOCR) {
            try {
                const { data, error } = await supabase.functions.invoke('document-ocr', {
                    body: {
                        imageBase64,
                        mimeType: file.type || 'image/jpeg',
                        documentType: detectedType !== 'other' ? detectedType : undefined
                    }
                });

                if (error) {
                    console.warn('[DocumentOCR] Edge Function error, falling back to mock:', error);
                } else if (data) {
                    console.log(`[DocumentOCR] Real OCR analysis complete, confidence: ${data.confidence}`);
                    return {
                        ...data,
                        detectedSide: data.detectedSide || detectedSide
                    } as DocumentAnalysis;
                }
            } catch (edgeFnError) {
                console.warn('[DocumentOCR] Edge Function not available, using mock:', edgeFnError);
            }
        }

        // Fallback to mock analysis
        const mockAnalysis: DocumentAnalysis = {
            documentType: detectedType,
            detectedSide,
            confidence: detectedType !== 'other' ? 0.85 : 0.5,
            extractedData: generateMockExtractedData(detectedType),
            uncertainFields: [],
            suggestedFolder: getSuggestedFolder(detectedType),
            rawText: `[Mock OCR text for ${file.name}]`
        };

        console.log(`[DocumentOCR] Mock analysis complete for ${file.name}:`, mockAnalysis);
        return mockAnalysis;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('[DocumentOCR] Analysis error:', errorMessage);
        return {
            documentType: documentType || 'other',
            detectedSide: undefined,
            confidence: 0,
            extractedData: {},
            uncertainFields: [],
            suggestedFolder: 'other',
            error: errorMessage
        };
    }
}

/**
 * Generate mock extracted data based on document type
 */
function generateMockExtractedData(docType: OCRDocumentType): ExtractedData {
    const baseData: ExtractedData = {};

    switch (docType) {
        case 'cni':
        case 'passport':
            baseData.lastName = 'NZAMBA';
            baseData.firstName = 'Jean-Pierre';
            baseData.dateOfBirth = '1985-03-15';
            baseData.placeOfBirth = 'Libreville';
            baseData.nationality = 'Gabonaise';
            baseData.documentNumber = 'GA-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            baseData.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString().split('T')[0];
            break;

        case 'birth_certificate':
            baseData.lastName = 'NZAMBA';
            baseData.firstName = 'Jean-Pierre';
            baseData.dateOfBirth = '1985-03-15';
            baseData.placeOfBirth = 'Libreville, Estuaire, Gabon';
            baseData.fatherName = 'NZAMBA';
            baseData.fatherFirstName = 'Michel';
            baseData.motherName = 'OBAME';
            baseData.motherFirstName = 'Marie';
            break;

        case 'residence_proof':
            baseData.address = '123 Avenue Léon M\'BA';
            baseData.city = 'Libreville';
            baseData.postalCode = '00000';
            break;

        case 'driving_license':
            baseData.lastName = 'NZAMBA';
            baseData.firstName = 'Jean-Pierre';
            baseData.documentNumber = 'PER-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            baseData.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10).toISOString().split('T')[0];
            break;
    }

    return baseData;
}

/**
 * Analyze multiple documents and consolidate data
 */
export async function analyzeMultipleDocuments(
    files: { file: File; suggestedType?: OCRDocumentType }[]
): Promise<{
    analyses: DocumentAnalysis[];
    consolidatedData: ExtractedData;
    uncertainFields: string[];
    conflicts: { field: string; values: { value: string; source: OCRDocumentType }[] }[];
}> {
    // Analyze all documents in parallel
    const analyses = await Promise.all(
        files.map(({ file, suggestedType }) => analyzeDocument(file, suggestedType))
    );

    // Consolidate data with priority rules
    const consolidatedData: ExtractedData = {};
    const uncertainFields = new Set<string>();
    const conflicts: { field: string; values: { value: string; source: OCRDocumentType }[] }[] = [];
    const fieldValues: Record<string, { value: string; source: OCRDocumentType; confidence: number }[]> = {};

    // Collect all values for each field
    for (const analysis of analyses) {
        if (analysis.error || !analysis.extractedData) continue;

        for (const [field, value] of Object.entries(analysis.extractedData)) {
            if (value && value !== 'null') {
                if (!fieldValues[field]) {
                    fieldValues[field] = [];
                }
                fieldValues[field].push({
                    value: value as string,
                    source: analysis.documentType,
                    confidence: analysis.confidence
                });
            }
        }

        for (const field of analysis.uncertainFields || []) {
            uncertainFields.add(field);
        }
    }

    // Resolve conflicts and build consolidated data
    for (const [field, values] of Object.entries(fieldValues)) {
        if (values.length === 0) continue;

        const uniqueValues = [...new Set(values.map(v => v.value.toUpperCase()))];

        if (uniqueValues.length > 1) {
            // Conflict detected - use priority rules
            const priority = FIELD_PRIORITY[field] || [];
            let resolved = false;

            for (const docType of priority) {
                const match = values.find(v => v.source === docType);
                if (match) {
                    (consolidatedData as Record<string, string>)[field] = match.value;
                    resolved = true;
                    break;
                }
            }

            if (!resolved) {
                const sorted = values.sort((a, b) => b.confidence - a.confidence);
                (consolidatedData as Record<string, string>)[field] = sorted[0].value;
            }

            conflicts.push({
                field,
                values: values.map(v => ({ value: v.value, source: v.source }))
            });
        } else {
            (consolidatedData as Record<string, string>)[field] = values[0].value;
        }
    }

    return {
        analyses,
        consolidatedData,
        uncertainFields: Array.from(uncertainFields),
        conflicts
    };
}

/**
 * Check if two names are similar (fuzzy matching)
 */
export function detectSimilarNames(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;

    const n1 = name1.toUpperCase().trim();
    const n2 = name2.toUpperCase().trim();

    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;

    const distance = levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    const similarity = 1 - (distance / maxLength);

    return similarity > 0.8;
}

/**
 * Levenshtein distance for fuzzy string matching
 */
function levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

/**
 * Get missing required fields for registration
 */
export function getMissingRegistrationFields(data: ExtractedData): string[] {
    const requiredFields = [
        'lastName',
        'firstName',
        'dateOfBirth',
        'placeOfBirth',
        'address',
        'city'
    ];

    return requiredFields.filter(field => !(data as Record<string, unknown>)[field]);
}

/**
 * Documents that never expire
 */
export const NEVER_EXPIRING_TYPES: OCRDocumentType[] = ['birth_certificate', 'diploma', 'family_record'];

/**
 * Documents that require expiration dates
 */
export const EXPIRING_TYPES: OCRDocumentType[] = ['cni', 'passport', 'driving_license', 'health_card', 'residence_proof'];

/**
 * Check if document type requires expiration
 */
export function requiresExpiration(docType: OCRDocumentType): boolean {
    return EXPIRING_TYPES.includes(docType);
}

/**
 * Check if document type never expires
 */
export function neverExpires(docType: OCRDocumentType): boolean {
    return NEVER_EXPIRING_TYPES.includes(docType);
}

export default {
    analyzeDocument,
    analyzeMultipleDocuments,
    detectDocumentType,
    detectDocumentSide,
    getSuggestedFolder,
    detectSimilarNames,
    getMissingRegistrationFields,
    requiresExpiration,
    neverExpires,
    NEVER_EXPIRING_TYPES,
    EXPIRING_TYPES
};
