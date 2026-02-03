import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SignatureData, formatSignatureDate, generateDocumentHash } from './signatureService';

let fontsInitialized = false;

function initializeFonts() {
  if (!fontsInitialized) {
    let vfs: any = undefined;

    if (pdfFonts && Object.keys(pdfFonts).some(k => k.endsWith('.ttf'))) {
      vfs = pdfFonts;
    } else if ((pdfFonts as any).default && Object.keys((pdfFonts as any).default).some((k: string) => k.endsWith('.ttf'))) {
      vfs = (pdfFonts as any).default;
    } else {
      vfs = (pdfFonts as any).pdfMake?.vfs
        || (pdfFonts as any).vfs
        || (pdfFonts as any).default?.pdfMake?.vfs
        || (pdfFonts as any).default?.vfs
        || (window as any).pdfMake?.vfs;
    }

    if (vfs) {
      (pdfMake as any).vfs = vfs;
      (pdfMake as any).fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };
      fontsInitialized = true;
    }
  }
}

interface RequestData {
  id: string;
  type: string;
  status: string;
  subject: string;
  description?: string;
  citizen_name: string;
  citizen_email: string;
  citizen_phone?: string;
  created_at: string;
  updated_at: string;
  organization?: { name: string } | null;
  service?: { name: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  PASSPORT: "Demande de Passeport",
  VISA: "Demande de Visa",
  CIVIL_REGISTRY: "Acte d'État Civil",
  LEGALIZATION: "Légalisation de Document",
  CONSULAR_CARD: "Carte Consulaire",
  ATTESTATION: "Attestation",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours de traitement",
  AWAITING_DOCUMENTS: "En attente de documents",
  VALIDATED: "Validée",
  REJECTED: "Rejetée",
  COMPLETED: "Terminée",
};

export async function generateApprovalPDF(
  request: RequestData, 
  signature?: SignatureData
): Promise<Blob> {
  initializeFonts();

  const currentDate = format(new Date(), "d MMMM yyyy", { locale: fr });
  const referenceNumber = `REF-${request.id.slice(0, 8).toUpperCase()}`;
  const documentHash = generateDocumentHash(JSON.stringify(request));

  const signatureBlock = signature ? [
    // Signature Section with Electronic Signature
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          stack: [
            { text: 'Signature Électronique', style: 'signatureTitle', alignment: 'center' },
            { text: '\n' },
            signature.signatureImage ? {
              image: signature.signatureImage,
              width: 150,
              height: 60,
              alignment: 'center' as const,
            } : { text: '', margin: [0, 30, 0, 0] },
            { text: signature.signedBy.name, style: 'signerName', alignment: 'center', margin: [0, 5, 0, 0] },
            { text: `Signé le ${formatSignatureDate(signature.signedAt)}`, style: 'signatureDate', alignment: 'center', margin: [0, 3, 0, 0] },
            { 
              text: `Vérification: ${documentHash}`, 
              style: 'verificationCode', 
              alignment: 'center', 
              margin: [0, 10, 0, 0],
              color: '#64748b',
              fontSize: 8
            }
          ]
        }
      ]
    }
  ] : [
    // Traditional Signature Section
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          stack: [
            { text: 'Le Chef de Service', style: 'signatureTitle', alignment: 'center' },
            { text: '\n\n\n' },
            { text: '________________________', alignment: 'center' },
            { text: 'Signature et cachet', style: 'signatureLabel', alignment: 'center', margin: [0, 5, 0, 0] }
          ]
        }
      ]
    }
  ];

  const documentDefinition: any = {
    pageSize: 'A4',
    pageMargins: [60, 80, 60, 80],
    content: [
      // Header
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'RÉPUBLIQUE GABONAISE', style: 'header', alignment: 'center' },
              { text: 'Union - Travail - Justice', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 0] },
              { text: '_______________', alignment: 'center', margin: [0, 10, 0, 20], color: '#1e3a8a' }
            ]
          }
        ]
      },

      // Document Type
      { 
        text: 'ATTESTATION DE VALIDATION', 
        style: 'documentTitle',
        margin: [0, 20, 0, 30]
      },

      // Reference and Date
      {
        columns: [
          { text: `Référence: ${referenceNumber}`, style: 'reference' },
          { text: `Libreville, le ${currentDate}`, style: 'date', alignment: 'right' }
        ],
        margin: [0, 0, 0, 30]
      },

      // Main Content
      {
        text: `Nous, soussignés, attestons par la présente que la demande ci-dessous a été examinée et validée par nos services:`,
        style: 'bodyText',
        margin: [0, 0, 0, 20]
      },

      // Request Details Table
      {
        table: {
          widths: ['35%', '65%'],
          body: [
            [
              { text: 'Type de demande', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: TYPE_LABELS[request.type] || request.type, style: 'tableCell' }
            ],
            [
              { text: 'Objet', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: request.subject, style: 'tableCell' }
            ],
            [
              { text: 'Demandeur', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: request.citizen_name, style: 'tableCell' }
            ],
            [
              { text: 'Email', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: request.citizen_email, style: 'tableCell' }
            ],
            [
              { text: 'Date de soumission', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: format(new Date(request.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr }), style: 'tableCell' }
            ],
            [
              { text: 'Date de validation', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: format(new Date(request.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr }), style: 'tableCell' }
            ],
            [
              { text: 'Statut', style: 'tableHeader', fillColor: '#f1f5f9' },
              { text: STATUS_LABELS[request.status] || request.status, style: 'tableCell', color: '#16a34a', bold: true }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 30]
      },

      // Description if exists
      ...(request.description ? [
        { text: 'Description:', style: 'sectionTitle', margin: [0, 0, 0, 10] },
        { text: request.description, style: 'bodyText', margin: [0, 0, 0, 30] }
      ] : []),

      // Closing Statement
      {
        text: `Cette attestation est délivrée pour servir et valoir ce que de droit.`,
        style: 'bodyText',
        margin: [0, 20, 0, 50]
      },

      ...signatureBlock
    ],
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { 
          text: signature 
            ? `Document signé électroniquement - Hash: ${documentHash} - Consulat.ga`
            : 'Document généré automatiquement - Consulat.ga', 
          style: 'footer',
          alignment: 'center'
        }
      ],
      margin: [60, 20, 60, 0]
    }),
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        color: '#1e3a8a'
      },
      subheader: {
        fontSize: 11,
        italics: true,
        color: '#64748b'
      },
      documentTitle: {
        fontSize: 20,
        bold: true,
        alignment: 'center',
        color: '#1e3a8a'
      },
      reference: {
        fontSize: 10,
        color: '#64748b'
      },
      date: {
        fontSize: 11
      },
      bodyText: {
        fontSize: 12,
        lineHeight: 1.5,
        alignment: 'justify'
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: '#1e3a8a'
      },
      tableHeader: {
        fontSize: 11,
        bold: true,
        color: '#374151'
      },
      tableCell: {
        fontSize: 11
      },
      signatureTitle: {
        fontSize: 12,
        bold: true
      },
      signerName: {
        fontSize: 11,
        bold: true
      },
      signatureDate: {
        fontSize: 10,
        color: '#64748b'
      },
      signatureLabel: {
        fontSize: 10,
        color: '#64748b'
      },
      verificationCode: {
        fontSize: 8,
        color: '#94a3b8'
      },
      footer: {
        fontSize: 8,
        color: '#94a3b8'
      }
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateAndDownloadPDF(
  requestId: string,
  signature?: SignatureData
): Promise<void> {
  // Fetch request data
  const { data: request, error } = await supabase
    .from("requests")
    .select(`
      *,
      organization:organizations(name),
      service:services(name)
    `)
    .eq("id", requestId)
    .single();

  if (error || !request) {
    throw new Error("Impossible de charger les données de la demande");
  }

  // Only allow PDF generation for validated/completed requests
  if (!["VALIDATED", "COMPLETED"].includes(request.status)) {
    throw new Error("La génération PDF n'est disponible que pour les demandes validées");
  }

  const blob = await generateApprovalPDF(request as RequestData, signature);
  
  // Download the PDF
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attestation-${request.id.slice(0, 8)}${signature ? '-signe' : ''}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateSignedPDF(
  requestId: string,
  signatureDataUrl: string,
  signerName: string,
  signerEmail: string
): Promise<void> {
  const signature: SignatureData = {
    signatureImage: signatureDataUrl,
    signedAt: new Date().toISOString(),
    signedBy: {
      name: signerName,
      email: signerEmail,
    },
  };

  return generateAndDownloadPDF(requestId, signature);
}

export async function generateMultiplePDFs(requestIds: string[]): Promise<void> {
  for (const id of requestIds) {
    await generateAndDownloadPDF(id);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
