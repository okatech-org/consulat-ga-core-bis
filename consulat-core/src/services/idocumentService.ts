/**
 * Service iDocument
 * Gestion du coffre-fort de documents avec Supabase Storage
 * Inspiré de mairie.ga
 */

import { supabase } from '@/integrations/supabase/client';
import {
    VaultDocument,
    DocumentCategory,
    DocumentSource,
    FileType,
    DocumentUploadData,
    DocumentStats,
    FOLDER_LABELS
} from '@/types/document';

const STORAGE_BUCKET = 'document-vault';
const LOCAL_STORAGE_KEY = 'idocument-vault-fallback';

// Helpers
function determineFileType(mimeType: string): FileType {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

// LocalStorage fallback
function getLocalDocuments(): VaultDocument[] {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveLocalDocuments(docs: VaultDocument[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
}

/**
 * Service principal iDocument
 */
export const idocumentService = {
    /**
     * Récupérer tous les documents du coffre-fort
     */
    async getDocuments(options?: {
        folder?: DocumentCategory;
        limit?: number;
        orderBy?: 'created_at' | 'name' | 'last_used_at';
    }): Promise<{ data: VaultDocument[]; error: Error | null }> {
        try {
            const userId = await getCurrentUserId();

            if (userId) {
                let query = supabase
                    .from('document_vault')
                    .select('*')
                    .eq('user_id', userId)
                    .order(options?.orderBy || 'created_at', { ascending: false });

                if (options?.folder) {
                    query = query.eq('folder_id', options.folder);
                }

                if (options?.limit) {
                    query = query.limit(options.limit);
                }

                const { data, error } = await query;

                if (!error && data) {
                    // Add public URLs
                    const docsWithUrls = data.map(doc => {
                        const { data: urlData } = supabase.storage
                            .from(STORAGE_BUCKET)
                            .getPublicUrl(doc.file_path);

                        return {
                            ...doc,
                            public_url: urlData.publicUrl
                        } as VaultDocument;
                    });

                    return { data: docsWithUrls, error: null };
                }
            }

            // Fallback to localStorage
            let localDocs = getLocalDocuments();
            if (options?.folder) {
                localDocs = localDocs.filter(d => d.folder_id === options.folder);
            }
            return { data: localDocs, error: null };

        } catch (error) {
            console.error('[iDocument] Get documents error:', error);
            return { data: getLocalDocuments(), error: error as Error };
        }
    },

    /**
     * Récupérer un document par ID
     */
    async getDocument(id: string): Promise<{ data: VaultDocument | null; error: Error | null }> {
        try {
            const userId = await getCurrentUserId();

            if (userId) {
                const { data, error } = await supabase
                    .from('document_vault')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (!error && data) {
                    const { data: urlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(data.file_path);

                    return {
                        data: { ...data, public_url: urlData.publicUrl } as VaultDocument,
                        error: null
                    };
                }
            }

            // Fallback
            const localDoc = getLocalDocuments().find(d => d.id === id);
            return { data: localDoc || null, error: null };

        } catch (error) {
            return { data: null, error: error as Error };
        }
    },

    /**
     * Uploader un document
     */
    async uploadDocument(
        uploadData: DocumentUploadData,
        source: DocumentSource = 'upload'
    ): Promise<{ data: VaultDocument | null; error: Error | null }> {
        try {
            const userId = await getCurrentUserId();
            const file = uploadData.file;

            // Generate unique file path
            const fileExt = file.name.split('.').pop() || 'bin';
            const timestamp = Date.now();
            const filePath = userId
                ? `${userId}/${uploadData.folder_id}/${timestamp}.${fileExt}`
                : `anonymous/${uploadData.folder_id}/${timestamp}.${fileExt}`;

            if (userId) {
                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(`Erreur d'upload: ${uploadError.message}`);
                }

                // Create database record
                const documentData = {
                    user_id: userId,
                    folder_id: uploadData.folder_id,
                    name: uploadData.name || file.name.replace(/\.[^/.]+$/, ''),
                    original_name: file.name,
                    file_path: filePath,
                    file_type: determineFileType(file.type),
                    file_size: file.size,
                    mime_type: file.type,
                    source,
                    status: 'pending' as const,
                    is_verified: false,
                    expiration_date: uploadData.expiration_date || null,
                    side: uploadData.side || null,
                    metadata: uploadData.metadata || {}
                };

                const { data, error: insertError } = await supabase
                    .from('document_vault')
                    .insert(documentData)
                    .select()
                    .single();

                if (insertError) {
                    // Cleanup
                    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
                    throw new Error(`Erreur de sauvegarde: ${insertError.message}`);
                }

                // Add public URL
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(filePath);

                return {
                    data: { ...data, public_url: urlData.publicUrl } as VaultDocument,
                    error: null
                };
            }

            // Fallback to localStorage
            const newDoc: VaultDocument = {
                id: `local-${timestamp}`,
                user_id: 'local',
                folder_id: uploadData.folder_id,
                name: uploadData.name || file.name.replace(/\.[^/.]+$/, ''),
                original_name: file.name,
                file_path: filePath,
                file_type: determineFileType(file.type),
                file_size: file.size,
                mime_type: file.type,
                source,
                status: 'pending',
                is_verified: false,
                verification_date: null,
                expiration_date: uploadData.expiration_date || null,
                side: uploadData.side,
                metadata: uploadData.metadata || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_used_at: null,
                public_url: URL.createObjectURL(file)
            };

            const localDocs = getLocalDocuments();
            saveLocalDocuments([newDoc, ...localDocs]);

            return { data: newDoc, error: null };

        } catch (error) {
            console.error('[iDocument] Upload error:', error);
            return { data: null, error: error as Error };
        }
    },

    /**
     * Supprimer un document
     */
    async deleteDocument(id: string): Promise<{ success: boolean; error: Error | null }> {
        try {
            const userId = await getCurrentUserId();

            if (userId) {
                // Get document to find file path
                const { data: doc } = await supabase
                    .from('document_vault')
                    .select('file_path')
                    .eq('id', id)
                    .single();

                if (doc) {
                    // Delete from storage
                    await supabase.storage
                        .from(STORAGE_BUCKET)
                        .remove([doc.file_path]);

                    // Delete from database
                    const { error } = await supabase
                        .from('document_vault')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                }
            }

            // Remove from localStorage too
            const localDocs = getLocalDocuments().filter(d => d.id !== id);
            saveLocalDocuments(localDocs);

            return { success: true, error: null };

        } catch (error) {
            return { success: false, error: error as Error };
        }
    },

    /**
     * Mettre à jour un document
     */
    async updateDocument(
        id: string,
        updates: Partial<Pick<VaultDocument, 'name' | 'folder_id' | 'expiration_date' | 'metadata'>>
    ): Promise<{ data: VaultDocument | null; error: Error | null }> {
        try {
            const userId = await getCurrentUserId();

            if (userId) {
                const { data, error } = await supabase
                    .from('document_vault')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data: data as VaultDocument, error: null };
            }

            // Fallback
            const localDocs = getLocalDocuments();
            const updatedDocs = localDocs.map(d =>
                d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
            );
            saveLocalDocuments(updatedDocs);

            return {
                data: updatedDocs.find(d => d.id === id) || null,
                error: null
            };

        } catch (error) {
            return { data: null, error: error as Error };
        }
    },

    /**
     * Marquer un document comme utilisé récemment
     */
    async markAsUsed(id: string): Promise<void> {
        const userId = await getCurrentUserId();
        if (userId) {
            await supabase
                .from('document_vault')
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', id);
        }
    },

    /**
     * Télécharger un document
     */
    async downloadDocument(id: string): Promise<{ data: Blob | null; error: Error | null }> {
        try {
            const { data: doc } = await this.getDocument(id);
            if (!doc) throw new Error('Document non trouvé');

            const userId = await getCurrentUserId();

            if (userId && doc.file_path) {
                const { data, error } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .download(doc.file_path);

                if (error) throw error;

                await this.markAsUsed(id);
                return { data, error: null };
            }

            // For local files, fetch from public_url
            if (doc.public_url) {
                const response = await fetch(doc.public_url);
                const blob = await response.blob();
                return { data: blob, error: null };
            }

            return { data: null, error: new Error('Fichier non disponible') };

        } catch (error) {
            return { data: null, error: error as Error };
        }
    },

    /**
     * Obtenir les statistiques des documents
     */
    async getStats(): Promise<DocumentStats> {
        const { data: docs } = await this.getDocuments();

        const stats: DocumentStats = {
            total: docs.length,
            verified: docs.filter(d => d.is_verified).length,
            pending: docs.filter(d => d.status === 'pending').length,
            expired: docs.filter(d => d.status === 'expired').length,
            byFolder: {
                identity: 0,
                civil_status: 0,
                residence: 0,
                education: 0,
                work: 0,
                health: 0,
                vehicle: 0,
                other: 0
            }
        };

        docs.forEach(doc => {
            if (doc.folder_id in stats.byFolder) {
                stats.byFolder[doc.folder_id]++;
            }
        });

        return stats;
    },

    /**
     * Obtenir les documents récents
     */
    async getRecentDocuments(limit: number = 5): Promise<VaultDocument[]> {
        const { data } = await this.getDocuments({
            orderBy: 'last_used_at',
            limit
        });
        return data.filter(d => d.last_used_at !== null);
    }
};

export default idocumentService;
