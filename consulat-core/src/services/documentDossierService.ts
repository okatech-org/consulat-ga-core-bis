/**
 * Document Dossier Service
 * Handles PDF generation for consolidated documents and secure sharing
 */

import { VaultDocument, FOLDER_LABELS, DocumentCategory } from '@/types/document';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

export interface DossierConfig {
    title: string;
    includeMetadata: boolean;
    includeTableOfContents: boolean;
    orientation: 'portrait' | 'landscape';
    quality: 'low' | 'medium' | 'high';
}

export interface DossierDocument {
    document: VaultDocument;
    pageNumber: number;
    isRectoVerso: boolean;
    rectoNumber?: number;
    versoNumber?: number;
}

/**
 * Get image dimensions maintaining aspect ratio
 */
function getImageDimensions(
    imgWidth: number,
    imgHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
        width: imgWidth * ratio,
        height: imgHeight * ratio
    };
}

/**
 * Load image as base64 for PDF embedding
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

/**
 * Generate PDF dossier from selected documents using jsPDF
 */
export async function generateDossier(
    documents: VaultDocument[],
    config: Partial<DossierConfig> = {}
): Promise<Blob> {
    const defaultConfig: DossierConfig = {
        title: `Dossier Documents - ${format(new Date(), 'dd/MM/yyyy')}`,
        includeMetadata: true,
        includeTableOfContents: true,
        orientation: 'portrait',
        quality: 'high',
        ...config
    };

    console.log('[DossierService] Generating PDF with config:', defaultConfig);
    console.log('[DossierService] Documents to include:', documents.length);

    // Create PDF instance
    const pdf = new jsPDF({
        orientation: defaultConfig.orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - 2 * margin;

    // === Cover Page ===
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(defaultConfig.title, pageWidth / 2, pageHeight / 3, { align: 'center' });

    // Metadata
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });
    pdf.text(`${documents.length} document${documents.length > 1 ? 's' : ''}`, pageWidth / 2, pageHeight / 3 + 30, { align: 'center' });

    // IDN.GA branding
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text('IDN.GA - Identité Numérique Gabonaise', pageWidth / 2, pageHeight - 20, { align: 'center' });

    // === Table of Contents ===
    if (defaultConfig.includeTableOfContents && documents.length > 1) {
        pdf.addPage();
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Table des Matières', margin, margin + 10);

        let yPosition = margin + 30;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        documents.forEach((doc, idx) => {
            const folder = FOLDER_LABELS[doc.folder_id as DocumentCategory] || 'Autre';
            const line = `${idx + 1}. ${doc.name}`;
            const folderText = `(${folder})`;

            pdf.text(line, margin, yPosition);
            pdf.setTextColor(100, 116, 139);
            pdf.text(folderText, pageWidth - margin, yPosition, { align: 'right' });
            pdf.setTextColor(0, 0, 0);

            yPosition += 8;

            // Add new page if needed
            if (yPosition > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin + 10;
            }
        });
    }

    // === Document Pages ===
    for (const doc of documents) {
        pdf.addPage();

        // Header
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.rect(0, 0, pageWidth, 25, 'F');

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(doc.name, margin, 16);

        // Folder badge
        const folder = FOLDER_LABELS[doc.folder_id as DocumentCategory] || 'Autre';
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(folder, pageWidth - margin, 16, { align: 'right' });

        // Side badge if recto/verso
        if (doc.side) {
            pdf.setFillColor(doc.side === 'front' ? 34 : 100, doc.side === 'front' ? 197 : 116, doc.side === 'front' ? 94 : 139);
            pdf.roundedRect(margin, 25, 25, 8, 2, 2, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(7);
            pdf.text(doc.side === 'front' ? 'RECTO' : 'VERSO', margin + 12.5, 30, { align: 'center' });
        }

        // Document image if available
        if (doc.public_url && doc.file_type === 'image') {
            try {
                const imageData = await loadImageAsBase64(doc.public_url);
                if (imageData) {
                    const img = new Image();
                    await new Promise<void>((resolve) => {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                        img.src = imageData;
                    });

                    if (img.width && img.height) {
                        const dims = getImageDimensions(
                            img.width,
                            img.height,
                            contentWidth,
                            contentHeight - 45 // Leave space for header
                        );
                        const x = (pageWidth - dims.width) / 2;
                        const y = 40;

                        pdf.addImage(imageData, 'JPEG', x, y, dims.width, dims.height);
                    }
                }
            } catch (imgError) {
                console.warn('[DossierService] Could not load image:', imgError);
                // Show placeholder
                pdf.setTextColor(100, 116, 139);
                pdf.setFontSize(12);
                pdf.text('Image non disponible', pageWidth / 2, pageHeight / 2, { align: 'center' });
            }
        } else {
            // PDF or other file type - show info
            pdf.setTextColor(30, 41, 59);
            pdf.setFontSize(11);
            const yStart = 50;
            pdf.text(`Type: ${doc.file_type?.toUpperCase() || 'Document'}`, margin, yStart);
            if (doc.created_at) {
                pdf.text(`Date d'ajout: ${format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}`, margin, yStart + 8);
            }
            if (doc.expiration_date) {
                pdf.text(`Expiration: ${format(new Date(doc.expiration_date), 'dd/MM/yyyy', { locale: fr })}`, margin, yStart + 16);
            }
        }

        // Footer
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    console.log('[DossierService] PDF generated with', pdf.getNumberOfPages(), 'pages');

    return pdf.output('blob');
}

/**
 * Download the generated PDF
 */
export function downloadDossier(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Dossier_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate secure share link for a document using Supabase signed URLs
 */
export async function generateShareLink(
    doc: VaultDocument,
    expiresInSeconds: number = 3600
): Promise<string> {
    console.log(`[DossierService] Generating share link for ${doc.name}, expires in ${expiresInSeconds}s`);

    // Try to use Supabase signed URL if file_path is available
    if (doc.file_path) {
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.file_path, expiresInSeconds);

            if (data?.signedUrl) {
                console.log('[DossierService] Supabase signed URL created');
                return data.signedUrl;
            }

            if (error) {
                console.warn('[DossierService] Supabase signed URL error:', error);
            }
        } catch (supabaseError) {
            console.warn('[DossierService] Supabase not available, using fallback:', supabaseError);
        }
    }

    // Fallback to custom token-based share link
    const token = btoa(JSON.stringify({
        docId: doc.id,
        userId: doc.user_id,
        name: doc.name,
        expires: Date.now() + expiresInSeconds * 1000
    }));

    const baseUrl = window.location.origin;
    return `${baseUrl}/share/doc/${token}`;
}

/**
 * Validate a share link token
 */
export function validateShareToken(token: string): {
    valid: boolean;
    docId?: string;
    userId?: string;
    expired?: boolean;
} {
    try {
        const decoded = JSON.parse(atob(token));
        const expired = Date.now() > decoded.expires;

        return {
            valid: !expired,
            docId: decoded.docId,
            userId: decoded.userId,
            expired
        };
    } catch {
        return { valid: false };
    }
}

/**
 * Calculate dossier preview info
 */
export function getDossierPreview(documents: VaultDocument[]): {
    totalPages: number;
    rectoVersoPairs: number;
    singleDocuments: number;
    estimatedSizeMB: number;
    folders: string[];
} {
    const processed = new Set<string>();
    let totalPages = 0;
    let rectoVersoPairs = 0;
    let singleDocuments = 0;
    const folders = new Set<string>();

    documents.forEach(doc => {
        if (processed.has(doc.id)) return;
        folders.add(doc.folder_id);

        if (doc.side === 'front') {
            const hasVerso = documents.some(d =>
                d.folder_id === doc.folder_id &&
                d.side === 'back' &&
                !processed.has(d.id) &&
                d.id !== doc.id
            );

            if (hasVerso) {
                rectoVersoPairs++;
                totalPages += 2;
                processed.add(doc.id);
                // Mark a verso as processed
                const verso = documents.find(d =>
                    d.folder_id === doc.folder_id &&
                    d.side === 'back' &&
                    !processed.has(d.id)
                );
                if (verso) processed.add(verso.id);
            } else {
                singleDocuments++;
                totalPages++;
                processed.add(doc.id);
            }
        } else if (!processed.has(doc.id)) {
            singleDocuments++;
            totalPages++;
            processed.add(doc.id);
        }
    });

    // Estimate size (rough calculation)
    const avgSizePerPage = 0.3; // MB
    const estimatedSizeMB = Math.round(totalPages * avgSizePerPage * 10) / 10;

    return {
        totalPages,
        rectoVersoPairs,
        singleDocuments,
        estimatedSizeMB,
        folders: Array.from(folders).map(f => FOLDER_LABELS[f as DocumentCategory] || f)
    };
}

export default {
    generateDossier,
    downloadDossier,
    generateShareLink,
    validateShareToken,
    getDossierPreview
};
