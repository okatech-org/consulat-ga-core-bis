import { useState, useCallback } from "react";
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { documentUploadService, type UploadedDocument } from "@/services/documentUploadService";

interface DocumentUploadItemProps {
  label: string;
  description?: string;
  onUpload: (doc: UploadedDocument) => void;
  uploadedDoc?: UploadedDocument;
  onRemove?: () => void;
  disabled?: boolean;
}

export function DocumentUploadItem({
  label,
  description = "PDF, JPG, PNG (max 5 Mo)",
  onUpload,
  uploadedDoc,
  onRemove,
  disabled = false,
}: DocumentUploadItemProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = documentUploadService.validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const doc = await documentUploadService.uploadDocument(file);
      setProgress(100);
      onUpload(doc);
      toast.success("Document téléchargé");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de téléchargement");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setProgress(0);
      e.target.value = "";
    }
  }, [onUpload]);

  return (
    <Card className={`p-4 transition-colors ${uploadedDoc ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'hover:border-primary/50'}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{label}</p>
          {uploadedDoc ? (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {uploadedDoc.name} ({documentUploadService.formatFileSize(uploadedDoc.size)})
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {isUploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <div className="w-24">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        ) : uploadedDoc ? (
          <Button variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
            <X className="h-4 w-4 text-red-500" />
          </Button>
        ) : (
          <label className={`cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Télécharger
              </span>
            </Button>
          </label>
        )}
      </div>
    </Card>
  );
}

interface DocumentUploadListProps {
  documents: { label: string; required?: boolean }[];
  uploadedDocs: Record<string, UploadedDocument>;
  onDocsChange: (docs: Record<string, UploadedDocument>) => void;
  disabled?: boolean;
}

export function DocumentUploadList({
  documents,
  uploadedDocs,
  onDocsChange,
  disabled = false,
}: DocumentUploadListProps) {
  const handleUpload = (label: string, doc: UploadedDocument) => {
    onDocsChange({ ...uploadedDocs, [label]: doc });
  };

  const handleRemove = async (label: string) => {
    const doc = uploadedDocs[label];
    if (doc) {
      try {
        await documentUploadService.deleteDocument(doc.path);
        const newDocs = { ...uploadedDocs };
        delete newDocs[label];
        onDocsChange(newDocs);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentUploadItem
          key={doc.label}
          label={doc.label + (doc.required ? " *" : "")}
          onUpload={(uploaded) => handleUpload(doc.label, uploaded)}
          uploadedDoc={uploadedDocs[doc.label]}
          onRemove={() => handleRemove(doc.label)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
