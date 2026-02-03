/**
 * Store iDocument (Zustand)
 * Gestion d'état pour le coffre-fort de documents
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    VaultDocument,
    DocumentCategory,
    DocumentFolder,
    DocumentStats,
    createFolderList
} from '@/types/document';
import { idocumentService } from '@/services/idocumentService';

interface IDocumentState {
    // Data
    documents: VaultDocument[];
    folders: DocumentFolder[];
    stats: DocumentStats | null;

    // UI State
    isLoading: boolean;
    error: string | null;
    selectedFolderId: DocumentCategory | null;
    selectedDocumentId: string | null;
    searchQuery: string;
    viewMode: 'folders' | 'documents' | 'all';

    // Computed
    filteredDocuments: () => VaultDocument[];
    selectedDocument: () => VaultDocument | null;
    documentsInFolder: (folderId: DocumentCategory) => VaultDocument[];

    // Actions
    fetchDocuments: () => Promise<void>;
    fetchStats: () => Promise<void>;
    addDocument: (doc: VaultDocument) => void;
    updateDocument: (id: string, updates: Partial<VaultDocument>) => void;
    deleteDocument: (id: string) => Promise<void>;

    // Navigation
    selectFolder: (folderId: DocumentCategory | null) => void;
    selectDocument: (docId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: (mode: 'folders' | 'documents' | 'all') => void;

    // Reset
    reset: () => void;
}

const initialState = {
    documents: [],
    folders: [],
    stats: null,
    isLoading: false,
    error: null,
    selectedFolderId: null,
    selectedDocumentId: null,
    searchQuery: '',
    viewMode: 'folders' as const,
};

export const useIDocumentStore = create<IDocumentState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Computed: Filtered documents
            filteredDocuments: () => {
                const { documents, selectedFolderId, searchQuery } = get();
                let filtered = [...documents];

                // Filter by folder
                if (selectedFolderId) {
                    filtered = filtered.filter(d => d.folder_id === selectedFolderId);
                }

                // Filter by search query
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered.filter(d =>
                        d.name.toLowerCase().includes(query) ||
                        d.original_name?.toLowerCase().includes(query)
                    );
                }

                return filtered;
            },

            // Computed: Selected document
            selectedDocument: () => {
                const { documents, selectedDocumentId } = get();
                return documents.find(d => d.id === selectedDocumentId) || null;
            },

            // Computed: Documents in a specific folder
            documentsInFolder: (folderId: DocumentCategory) => {
                return get().documents.filter(d => d.folder_id === folderId);
            },

            // Fetch all documents
            fetchDocuments: async () => {
                set({ isLoading: true, error: null });

                try {
                    const { data, error } = await idocumentService.getDocuments();

                    if (error) throw error;

                    const folders = createFolderList(data);

                    set({
                        documents: data,
                        folders,
                        isLoading: false
                    });
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        isLoading: false
                    });
                }
            },

            // Fetch statistics
            fetchStats: async () => {
                try {
                    const stats = await idocumentService.getStats();
                    set({ stats });
                } catch (error) {
                    console.error('[IDocumentStore] Stats error:', error);
                }
            },

            // Add a document
            addDocument: (doc: VaultDocument) => {
                set(state => {
                    const newDocs = [doc, ...state.documents];
                    return {
                        documents: newDocs,
                        folders: createFolderList(newDocs)
                    };
                });
            },

            // Update a document
            updateDocument: (id: string, updates: Partial<VaultDocument>) => {
                set(state => {
                    const newDocs = state.documents.map(d =>
                        d.id === id ? { ...d, ...updates } : d
                    );
                    return {
                        documents: newDocs,
                        folders: createFolderList(newDocs)
                    };
                });
            },

            // Delete a document
            deleteDocument: async (id: string) => {
                const { success, error } = await idocumentService.deleteDocument(id);

                if (success) {
                    set(state => {
                        const newDocs = state.documents.filter(d => d.id !== id);
                        return {
                            documents: newDocs,
                            folders: createFolderList(newDocs),
                            selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId
                        };
                    });
                } else if (error) {
                    set({ error: error.message });
                }
            },

            // Select a folder
            selectFolder: (folderId: DocumentCategory | null) => {
                set({
                    selectedFolderId: folderId,
                    viewMode: folderId ? 'documents' : 'folders',
                    selectedDocumentId: null
                });
            },

            // Select a document
            selectDocument: (docId: string | null) => {
                set({ selectedDocumentId: docId });
            },

            // Set search query
            setSearchQuery: (query: string) => {
                set({ searchQuery: query });
            },

            // Set view mode
            setViewMode: (mode: 'folders' | 'documents' | 'all') => {
                set({
                    viewMode: mode,
                    selectedFolderId: mode === 'folders' ? null : get().selectedFolderId
                });
            },

            // Reset store
            reset: () => {
                set(initialState);
            }
        }),
        {
            name: 'idocument-store',
            partialize: (state) => ({
                documents: state.documents,
                viewMode: state.viewMode
            })
        }
    )
);

export default useIDocumentStore;
