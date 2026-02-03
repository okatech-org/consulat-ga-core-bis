import { supabase } from "@/integrations/supabase/client";

export interface UploadedDocument {
  name: string;
  path: string;
  size: number;
  type: string;
}

export const documentUploadService = {
  async uploadDocument(file: File, requestId?: string): Promise<UploadedDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour télécharger des documents");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${requestId || 'temp'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('request-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Erreur lors du téléchargement du fichier");
    }

    return {
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
    };
  },

  async getDocumentUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
      .from('request-documents')
      .createSignedUrl(path, 3600);

    if (!data?.signedUrl) {
      throw new Error("Impossible de générer l'URL du document");
    }

    return data.signedUrl;
  },

  async deleteDocument(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('request-documents')
      .remove([path]);

    if (error) {
      throw new Error("Erreur lors de la suppression du document");
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: "Le fichier dépasse la taille maximale de 5 Mo" };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Format non autorisé. Utilisez PDF, JPG, PNG ou WEBP" };
    }

    return { valid: true };
  }
};
