/**
 * Service for managing electronic signatures
 */

export interface SignatureData {
  signatureImage: string; // Base64 PNG data URL
  signedAt: string; // ISO timestamp
  signedBy: {
    name: string;
    email: string;
    userId?: string;
  };
  documentId?: string;
  documentType?: string;
}

export interface SignedDocument {
  id: string;
  originalDocument: Blob;
  signature: SignatureData;
  signedDocument: Blob;
}

/**
 * Adds a signature image to a PDF document
 * This creates a visual representation of the signature on the document
 */
export async function addSignatureToPdf(
  pdfBlob: Blob,
  signatureDataUrl: string,
  signerInfo: { name: string; email: string },
  options: {
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<Blob> {
  // Since we're using pdfmake for generation, we'll integrate the signature
  // during PDF generation rather than modifying an existing PDF
  // This function is kept for potential future use with external PDFs
  
  const signatureData: SignatureData = {
    signatureImage: signatureDataUrl,
    signedAt: new Date().toISOString(),
    signedBy: {
      name: signerInfo.name,
      email: signerInfo.email,
    },
  };

  // Store signature metadata
  localStorage.setItem(
    `signature_${Date.now()}`,
    JSON.stringify(signatureData)
  );

  return pdfBlob;
}

/**
 * Validates a signature data URL
 */
export function validateSignature(signatureDataUrl: string): boolean {
  if (!signatureDataUrl) return false;
  if (!signatureDataUrl.startsWith("data:image/png;base64,")) return false;
  
  // Check if the base64 data is not empty (more than just a blank canvas)
  const base64Data = signatureDataUrl.split(",")[1];
  if (!base64Data || base64Data.length < 1000) {
    // A valid signature should have more data than a blank canvas
    return false;
  }
  
  return true;
}

/**
 * Creates signature metadata for embedding in documents
 */
export function createSignatureMetadata(
  signerName: string,
  signerEmail: string,
  signatureDataUrl: string
): SignatureData {
  return {
    signatureImage: signatureDataUrl,
    signedAt: new Date().toISOString(),
    signedBy: {
      name: signerName,
      email: signerEmail,
    },
  };
}

/**
 * Formats signature date for display
 */
export function formatSignatureDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generates a unique document hash for signature verification
 */
export function generateDocumentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Creates a signature block for PDF documents
 */
export function createSignatureBlock(
  signature: SignatureData,
  documentReference: string
): Record<string, any> {
  return {
    stack: [
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 200,
            y2: 0,
            lineWidth: 1,
            lineColor: "#e2e8f0",
          },
        ],
        margin: [0, 20, 0, 10],
      },
      {
        text: "Signature électronique",
        style: "signatureHeader",
        margin: [0, 0, 0, 5],
      },
      signature.signatureImage
        ? {
            image: signature.signatureImage,
            width: 150,
            height: 60,
            margin: [0, 5, 0, 5],
          }
        : { text: "", margin: [0, 30, 0, 0] },
      {
        text: signature.signedBy.name,
        style: "signerName",
      },
      {
        text: `Signé le ${formatSignatureDate(signature.signedAt)}`,
        style: "signatureDate",
      },
      {
        text: `Référence: ${documentReference}`,
        style: "documentReference",
        margin: [0, 5, 0, 0],
      },
    ],
    margin: [0, 20, 0, 0],
  };
}
