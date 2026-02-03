import { jsPDF } from "jspdf";

/**
 * Génère un PDF A4 avec la carte CNAMGS à l'échelle exacte ID-1 (85.60 × 53.98 mm),
 * traits de coupe, sections d'informations et zones images (armoiries, logo, photo).
 *
 * — Vectoriel : rectangles, lignes, textes
 * — Images : intégrées depuis URLs / dataURL (logos, photo)
 * — Grille optionnelle pour calage
 */
export type CNAMGSData = {
    numero: string; // "001-012-198-2"
    nom: string; // "PELLEN-LAKOUMBA"
    prenoms: string; // "GUEYLORD ASTED"
    dateNaissance: string; // "01/12/1982"
    lieuNaissance?: string; // "Libreville"
    age?: string; // "42 ans"
    sexe?: "M" | "F";
    regime: string; // "Secteur Privé"
    qualite?: string; // "Assuré principal"
    employeur: string; // "ORGANÉUS GABON"
    numeroAttestation?: string; // "2025/CNAMGS/00001234"
    dateDebut?: string; // "01/01/2025"
    dateFin?: string; // "31/12/2025"
    statut?: "Actif" | "Inactif";
    couvertures: {
        type: string;
        taux: string; // "80%"
        ticket: string; // "20% ..."
    }[];
};

export type CNAMGSAssets = {
    armoiriesUrl?: string; // ex: "/emblem_gabon.png"
    cnamgsLogoUrl?: string; // ex: "/cnamgs_logo.png"
    photoUrl?: string; // ex: "/photo_titulaire.png"
};

export type CNAMGSPdfOptions = {
    showGrid?: boolean; // afficher une grille de calage subtile
    downloadFileName?: string; // si fourni, déclenche un téléchargement
};

// Constantes tailles
const A4 = { w: 210, h: 297 }; // mm
const CARD = { w: 85.6, h: 53.98, radius: 3 }; // ID-1 (ISO/IEC 7810)
const MARGIN = 15; // mm

// Placement carte (dans la section INFORMATIONS DE L'ASSURÉ)
const HEADER_H = 53; // mm - en-tête + titre

// Utilitaires -----------------------------------------------------------------
const loadImageAsDataUrl = (src: string): Promise<string> =>
    new Promise((resolve) => {
        if (!src) return resolve("");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const data = canvas.toDataURL("image/png");
                    resolve(data);
                } catch {
                    resolve("");
                }
            } else {
                resolve("");
            }
        };
        img.onerror = () => resolve("");
        img.src = src;
    });

// Charge une image et la découpe en ellipse (comme dans l'application)
const loadEllipticalImageAsDataUrl = (src: string, width: number = 260, height: number = 320): Promise<string> =>
    new Promise((resolve) => {
        if (!src) return resolve("");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Activer l'anti-aliasing pour une ellipse lisse
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Créer un clip elliptique
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Dessiner l'image centrée et couvrant toute l'ellipse
                const scale = Math.max(width / img.width, height / img.height);
                const x = (width - img.width * scale) / 2;
                const y = (height - img.height * scale) / 2;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                ctx.restore();

                try {
                    const data = canvas.toDataURL("image/png");
                    resolve(data);
                } catch {
                    resolve("");
                }
            } else {
                resolve("");
            }
        };
        img.onerror = () => resolve("");
        img.src = src;
    });

// Charge le filigrane en ultra haute résolution avec opacité
const loadWatermarkHighRes = (src: string, opacity: number = 0.25): Promise<string> =>
    new Promise((resolve) => {
        if (!src) return resolve("");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Ultra high resolution comme pour le SVG
            const scale = 6;
            const targetWidth = 856;
            const targetHeight = 477; // Hauteur de la partie basse (73.4% de 650px)

            canvas.width = targetWidth * scale;
            canvas.height = targetHeight * scale;

            const ctx = canvas.getContext("2d", {
                alpha: true,
                desynchronized: false,
                colorSpace: 'srgb'
            });

            if (ctx) {
                // Enable high-quality rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Appliquer l'opacité
                ctx.globalAlpha = opacity;

                // Scale and draw with anti-aliasing
                ctx.scale(scale, scale);

                // Dessiner l'image en couvrant toute la zone
                const scaleX = targetWidth / img.width;
                const scaleY = targetHeight / img.height;
                const imgScale = Math.max(scaleX, scaleY);
                const imgW = img.width * imgScale;
                const imgH = img.height * imgScale;
                const imgX = (targetWidth - imgW) / 2;
                const imgY = (targetHeight - imgH) / 2;

                ctx.drawImage(img, imgX, imgY, imgW, imgH);

                try {
                    const dataUrl = canvas.toDataURL('image/png', 1.0);
                    resolve(dataUrl);
                } catch {
                    resolve("");
                }
            } else {
                resolve("");
            }
        };
        img.onerror = () => resolve("");
        img.src = src;
    });

const drawCutMarks = (
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    len = 3
) => {
    doc.setLineWidth(0.1);
    doc.setDrawColor(150, 150, 150);
    // Coins
    const corners = [
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
    ];
    corners.forEach(([cx, cy]) => {
        doc.line(cx - len, cy, cx + len, cy);
        doc.line(cx, cy - len, cx, cy + len);
    });
};

const drawGrid = (doc: jsPDF, step = 10) => {
    doc.setLineWidth(0.05);
    doc.setDrawColor(200, 200, 200);
    for (let x = 0; x <= A4.w; x += step) {
        doc.line(x, 0, x, A4.h);
    }
    for (let y = 0; y <= A4.h; y += step) {
        doc.line(0, y, A4.w, y);
    }
};

// Fonction principale ---------------------------------------------------------
// Helper to capture SVG as high-res image, excluding emblem and photo
const captureSVGAsImage = async (): Promise<string> => {
    const svgContainer = document.querySelector('.cnamgs-card-svg');
    if (!svgContainer) return "";

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return "";

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    // Masquer l'emblème des armoiries (on le superposera après)
    const emblemImage = clonedSvg.querySelector('#img-coat-of-arms');
    if (emblemImage) {
        emblemImage.setAttribute('opacity', '0');
    }

    // Masquer le logo CNAMGS (on le superposera après pour meilleure qualité)
    const logoImage = clonedSvg.querySelector('#img-cnamgs-logo');
    if (logoImage) {
        logoImage.setAttribute('opacity', '0');
    }

    // Masquer la puce (on la superposera après pour meilleure qualité)
    const chipImage = clonedSvg.querySelector('#chip');
    if (chipImage) {
        chipImage.setAttribute('opacity', '0');
    }

    // Masquer la photo d'identité (on la superposera après avec clip ellipse)
    const photoPlaceholder = clonedSvg.querySelector('#photo-placeholder');
    if (photoPlaceholder) {
        photoPlaceholder.setAttribute('opacity', '0');
    }

    // Masquer toutes les images dynamiques
    const allImages = clonedSvg.querySelectorAll('image');
    allImages.forEach(img => {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
        if (href.includes('http') || href.includes('blob:') || href.includes('data:')) {
            img.setAttribute('opacity', '0');
        }
    });

    // Set explicit width and height for high resolution
    const svgWidth = 1050; // Dimensions du template
    const svgHeight = 650;

    clonedSvg.setAttribute('width', svgWidth.toString());
    clonedSvg.setAttribute('height', svgHeight.toString());

    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Ultra high resolution: 600 DPI equivalent for crisp output
            const scale = 6;
            const targetWidth = 856; // Target width in pixels for 85.6mm
            const targetHeight = 540; // Target height in pixels for 53.98mm

            canvas.width = targetWidth * scale;
            canvas.height = targetHeight * scale;

            const ctx = canvas.getContext('2d', {
                alpha: true,
                desynchronized: false,
                colorSpace: 'srgb'
            });

            if (ctx) {
                // Enable high-quality rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Scale and draw with anti-aliasing
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Export as high-quality PNG
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                URL.revokeObjectURL(url);
                resolve(dataUrl);
            } else {
                URL.revokeObjectURL(url);
                resolve("");
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve("");
        };
        img.src = url;
    });
};

export const generateCNAMGSPdf = async (
    data: CNAMGSData,
    assets?: CNAMGSAssets,
    opts?: CNAMGSPdfOptions
): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Grille optionnelle
    if (opts?.showGrid) {
        drawGrid(doc);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EN-TÊTE OFFICIEL (Coordonnées à gauche, Logo et texte à droite)
    // ═══════════════════════════════════════════════════════════════════════════

    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, A4.w, 35, "F");

    // Accent rose vibrant en haut (#E63B7A)
    doc.setFillColor(230, 59, 122);
    doc.rect(0, 0, A4.w, 1.5, "F");

    // BLOC COORDONNÉES À GAUCHE - aligné avec le logo CNAMGS
    const contactW = 60; // Réduit de 1/5 (75 -> 60)
    const contactH = 22; // Hauteur ajustée
    const contactX = MARGIN;
    const contactY = 6; // Aligné avec le logo CNAMGS

    // Bloc gris clair pour les coordonnées
    doc.setFillColor(248, 249, 250); // muted background
    doc.setDrawColor(226, 232, 240); // border
    doc.setLineWidth(0.15);
    doc.roundedRect(contactX, contactY, contactW, contactH, 2, 2, "FD");

    let contactTextY = contactY + 4.5;

    // Ligne 1 : Siège Social sur une ligne
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(38, 43, 51); // foreground
    doc.text("CNAMGS - Siège Social :", contactX + 2, contactTextY);
    doc.setFont("helvetica", "normal");
    doc.text("Libreville, Gabon", contactX + 29, contactTextY);

    // Ligne 2 : Téléphone
    contactTextY += 4.5;
    doc.setFont("helvetica", "bold");
    doc.text("Téléphone :", contactX + 2, contactTextY);
    doc.setFont("helvetica", "normal");
    doc.text("+241 01 XX XX XX", contactX + 16, contactTextY);

    // Ligne 3 : Email
    contactTextY += 4.5;
    doc.setFont("helvetica", "bold");
    doc.text("Email :", contactX + 2, contactTextY);
    doc.setFont("helvetica", "normal");
    doc.text("contact@cnamgs.ga", contactX + 10, contactTextY);

    // Ligne 4 : Site web
    contactTextY += 4.5;
    doc.setFont("helvetica", "bold");
    doc.text("Site web :", contactX + 2, contactTextY);
    doc.setFont("helvetica", "normal");
    doc.text("www.cnamgs.ga", contactX + 13, contactTextY);

    // LOGO ET TEXTE À DROITE
    // Charger et afficher le logo CNAMGS
    const headerLogoData = await loadImageAsDataUrl('/cnamgs_header_logo.png');
    if (headerLogoData) {
        const logoW = 60; // Largeur du logo en mm
        const logoH = 12; // Hauteur réduite
        const logoX = (A4.w + contactX + contactW - logoW) / 2 + 10; // Centrer dans l'espace de droite
        const logoY = 6; // Position verticale
        doc.addImage(headerLogoData, "PNG", logoX, logoY, logoW, logoH);
    }

    // Sous-titre (en gras)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 112, 133); // muted-foreground - gris
    const centerX = (A4.w + contactX + contactW) / 2 + 10;
    doc.text("CAISSE NATIONALE D'ASSURANCE MALADIE", centerX, 24, { align: "center" });
    doc.text("ET DE GARANTIE SOCIALE", centerX, 29, { align: "center" });

    // ═══════════════════════════════════════════════════════════════════════════
    // TITRE DU DOCUMENT (même largeur que les autres blocs)
    // ═══════════════════════════════════════════════════════════════════════════

    const titleBlockW = A4.w - 2 * MARGIN; // Même largeur que les autres blocs

    // Fond très clair (background: 0 0% 98%) - plus compact
    doc.setFillColor(250, 250, 250);
    doc.rect(MARGIN, 35, titleBlockW, 15, "F");

    // Bordure gauche turquoise (#17CCB9)
    doc.setFillColor(23, 204, 185);
    doc.rect(MARGIN, 35, 1.2, 15, "F");

    // Titre (foreground: 210 20% 15%)
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(38, 43, 51); // foreground color
    doc.text("ATTESTATION DE DROITS", MARGIN + 3, 42);

    // Numéro d'attestation (muted-foreground: 215 16% 47%)
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133); // muted-foreground
    const numAttestation = data.numeroAttestation || `2025/CNAMGS/${data.numero.replace(/-/g, '')}`;
    doc.text(`N° ATTESTATION : ${numAttestation}`, MARGIN + 3, 47);

    // Charger les images pour la carte (à utiliser plus tard)
    const armoiriesData = assets?.armoiriesUrl
        ? await loadImageAsDataUrl(assets.armoiriesUrl)
        : "";
    const logoData = assets?.cnamgsLogoUrl
        ? await loadImageAsDataUrl(assets.cnamgsLogoUrl)
        : "";
    const chipData = await loadImageAsDataUrl('/puce_cnamgs.png');
    const watermarkData = await loadWatermarkHighRes('/fili_cnamgs.png', 0.25);
    const photoData = assets?.photoUrl
        ? await loadEllipticalImageAsDataUrl(assets.photoUrl, 260, 320)
        : "";
    const cardImageData = await captureSVGAsImage();

    // ═══════════════════════════════════════════════════════════════════════════
    // MESSAGE PERSONNALISÉ (pleine largeur) - plus compact
    // ═══════════════════════════════════════════════════════════════════════════

    let currentY = HEADER_H + 5;
    const messageWidth = A4.w - 2 * MARGIN;

    // Encadré message personnalisé (card: 0 0% 100% avec border)
    doc.setFillColor(255, 255, 255); // card background
    doc.setDrawColor(226, 232, 240); // border color (214 32% 91%)
    doc.setLineWidth(0.15);
    doc.roundedRect(MARGIN, currentY, messageWidth, 34, 3, 3, "FD");

    currentY += 4;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 204, 185); // primary turquoise
    doc.text("VOTRE ATTESTATION DE DROITS", MARGIN + 3, currentY);

    currentY += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(38, 43, 51); // foreground

    const salutation = data.sexe === "F" ? "Chère madame" : "Cher monsieur";
    doc.text(`${salutation} ${data.nom},`, MARGIN + 3, currentY);

    currentY += 5;

    const messageLines = [
        "Pour être mieux suivi, respectez le parcours de soins coordonné et présentez cette attestation lors de chaque",
        "consultation médicale.",
        "",
        "En cas de changement d'activité, de déménagement ou de situation familiale, pensez à informer rapidement la",
        "CNAMGS pour mettre à jour vos droits et votre carte d'assuré."
    ];

    doc.setFontSize(8.5);
    messageLines.forEach(line => {
        doc.text(line, MARGIN + 3, currentY);
        currentY += line === "" ? 2.5 : 4;
    });

    currentY += 3;

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 161, 254); // secondary blue (#00A1FE)
    doc.text("Avec toute notre attention,", MARGIN + 3, currentY);
    currentY += 3.5;
    doc.text("Votre correspondant CNAMGS", MARGIN + 3, currentY);

    currentY += 8;

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 1 : Informations de l'Assuré (avec carte CNAMGS)
    // ═══════════════════════════════════════════════════════════════════════════

    // Titre de section (primary-light background) - largeur totale - plus compact
    doc.setFillColor(210, 239, 235); // primary-light (173 70% 85%)
    doc.rect(MARGIN, currentY, A4.w - 2 * MARGIN, 6, "F");
    doc.setFillColor(23, 204, 185); // primary turquoise
    doc.rect(MARGIN, currentY, 0.8, 6, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 204, 185); // primary turquoise
    doc.text("INFORMATIONS DE L'ASSURÉ", MARGIN + 3, currentY + 4);
    currentY += 8;

    // Position de la carte dans cette section (à droite)
    const CARD_Y = currentY;
    const CARD_X = A4.w - MARGIN - CARD.w;
    const shadowOffset = 0.15;

    // Ombre diffuse pour la carte
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(CARD_X + 0.5, CARD_Y + 0.5, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(CARD_X + 0.4, CARD_Y + 0.4, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(CARD_X + 0.3, CARD_Y + 0.3, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(CARD_X + 0.25, CARD_Y + 0.25, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(CARD_X + 0.2, CARD_Y + 0.2, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");
    doc.setFillColor(210, 210, 210);
    doc.roundedRect(CARD_X + shadowOffset, CARD_Y + shadowOffset, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");

    // Fond blanc avec coins arrondis pour la carte
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(CARD_X, CARD_Y, CARD.w, CARD.h, CARD.radius, CARD.radius, "F");

    if (cardImageData) {
        const imgMargin = 0.1;
        const imgX = CARD_X + imgMargin;
        const imgY = CARD_Y + imgMargin;
        const imgW = CARD.w - 2 * imgMargin;
        const imgH = CARD.h - 2 * imgMargin;

        doc.addImage(cardImageData, "PNG", imgX, imgY, imgW, imgH, undefined, 'FAST');

        if (watermarkData) {
            const watermarkY = CARD_Y + CARD.h * 0.266 + imgMargin;
            const watermarkH = CARD.h * 0.734 - 2 * imgMargin;
            doc.addImage(watermarkData, "PNG", imgX, watermarkY, imgW, watermarkH, undefined, 'FAST');
        }

        if (armoiriesData) {
            const emblemW = CARD.w * 0.1314;
            const emblemH = emblemW;
            const emblemX = CARD_X + CARD.w * 0.0352;
            const emblemY = CARD_Y + CARD.h * 0.0231;
            doc.addImage(armoiriesData, "PNG", emblemX, emblemY, emblemW, emblemH);
        }

        if (logoData) {
            const logoW = CARD.w * 0.3810;
            const logoH = logoW * 0.20;
            const logoX = CARD_X + CARD.w * 0.5810;
            const logoY = CARD_Y + CARD.h * 0.0446 + 1;
            doc.addImage(logoData, "PNG", logoX, logoY, logoW, logoH);
        }

        if (chipData) {
            const chipW = CARD.w * 0.1543;
            const chipH = CARD.h * 0.1923;
            const chipX = CARD_X + CARD.w * 0.0886;
            const chipY = CARD_Y + CARD.h * 0.3431;
            doc.addImage(chipData, "PNG", chipX, chipY, chipW, chipH);
        }

        if (photoData) {
            const photoRx = CARD.w * 0.1238;
            const photoRy = CARD.h * 0.2462;
            const photoCx = CARD_X + CARD.w * 0.8067;
            const photoCy = CARD_Y + CARD.h * 0.6877;
            const photoX = photoCx - photoRx;
            const photoY = photoCy - photoRy;
            const photoW = photoRx * 2;
            const photoH = photoRy * 2;
            const maxPhotoX = CARD_X + CARD.w - photoW - 0.5;
            const maxPhotoY = CARD_Y + CARD.h - photoH - 0.5;
            const finalPhotoX = Math.min(photoX, maxPhotoX);
            const finalPhotoY = Math.min(photoY, maxPhotoY);
            doc.addImage(photoData, "PNG", finalPhotoX, finalPhotoY, photoW, photoH);
        }
    }

    doc.setLineWidth(0.08);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(CARD_X, CARD_Y, CARD.w, CARD.h, CARD.radius, CARD.radius);
    doc.setLineWidth(0.05);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(CARD_X + 0.1, CARD_Y + 0.1, CARD.w - 0.2, CARD.h - 0.2, CARD.radius - 0.05, CARD.radius - 0.05);

    // Grille d'informations (à gauche de la carte, 1 colonne)
    const infoColW = A4.w - CARD.w - 3 * MARGIN - 5;

    const drawInfoBox = (label: string, value: string, x: number, y: number, w: number) => {
        // Fond (card white avec border subtile) - plus compact
        doc.setFillColor(255, 255, 255); // card
        doc.setDrawColor(226, 232, 240); // border (214 32% 91%)
        doc.setLineWidth(0.12);
        doc.roundedRect(x, y, w, 9, 2, 2, "FD");

        // Label (muted-foreground)
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(102, 112, 133); // muted-foreground (215 16% 47%)
        doc.text(label, x + 2, y + 3.2);

        // Valeur (foreground)
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(38, 43, 51); // foreground (210 20% 15%)
        doc.text(value, x + 2, y + 6.8);
    };

    // Informations en colonne à gauche de la carte - plus compact
    // NUMÉRO D'ASSURÉ et STATUT sur la même ligne (2 colonnes)
    const halfColW = (infoColW - 2) / 2;
    drawInfoBox("NUMÉRO D'ASSURÉ", data.numero, MARGIN, currentY, halfColW);

    // Statut badge
    const statutX = MARGIN + halfColW + 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.12);
    doc.roundedRect(statutX, currentY, halfColW, 9, 2, 2, "FD");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133);
    doc.text("STATUT", statutX + 2, currentY + 3.2);

    const statut = data.statut || "ACTIF";
    const isActif = statut !== "Inactif";
    doc.setFillColor(isActif ? 230 : 239, isActif ? 59 : 68, isActif ? 122 : 68);
    doc.roundedRect(statutX + 2, currentY + 4.5, 16, 3.5, 2, 2, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(statut, statutX + 4, currentY + 7.2);
    currentY += 10.5;

    // NOM sur une ligne séparée
    drawInfoBox("NOM", data.nom, MARGIN, currentY, infoColW);
    currentY += 10.5;

    // PRÉNOMS sur sa propre ligne
    drawInfoBox("PRÉNOMS", data.prenoms, MARGIN, currentY, infoColW);
    currentY += 10.5;

    // DATE DE NAISSANCE et LIEU DE NAISSANCE sur la même ligne
    drawInfoBox("DATE DE NAISSANCE", data.dateNaissance, MARGIN, currentY, halfColW);
    drawInfoBox("LIEU DE NAISSANCE", data.lieuNaissance || "Non renseigné", MARGIN + halfColW + 2, currentY, halfColW);
    currentY += 10.5;

    // RÉGIME et QUALITÉ sur la même ligne
    drawInfoBox("RÉGIME", data.regime, MARGIN, currentY, halfColW);
    drawInfoBox("QUALITÉ", data.qualite || "Assuré Principal", MARGIN + halfColW + 2, currentY, halfColW);

    currentY += 13;

    // S'assurer qu'on passe en dessous de la carte
    currentY = Math.max(currentY, CARD_Y + CARD.h + 5);

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 2 : Droits et Taux de Couverture (pleine largeur)
    // ═══════════════════════════════════════════════════════════════════════════

    // Titre de section - plus compact
    doc.setFillColor(210, 239, 235); // primary-light
    doc.rect(MARGIN, currentY, A4.w - 2 * MARGIN, 6, "F");
    doc.setFillColor(23, 204, 185); // primary turquoise
    doc.rect(MARGIN, currentY, 0.8, 6, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 204, 185); // primary turquoise
    doc.text("DROITS ET TAUX DE COUVERTURE", MARGIN + 3, currentY + 4);
    currentY += 8;

    // Tableau des couvertures - plus compact
    const tableX = MARGIN;
    const tableW = A4.w - 2 * MARGIN;
    const col1W = tableW * 0.5;
    const col2W = tableW * 0.25;
    const col3W = tableW * 0.25;
    const rowH = 7;

    // En-tête du tableau (primary turquoise)
    doc.setFillColor(23, 204, 185); // primary turquoise
    doc.rect(tableX, currentY, tableW, rowH, "F");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Type de Prestation", tableX + 3, currentY + 4.8);
    doc.text("Taux de Couverture", tableX + col1W + 3, currentY + 4.8);
    doc.text("Ticket Modérateur", tableX + col1W + col2W + 3, currentY + 4.8);
    currentY += rowH;

    // Lignes du tableau - plus compact
    data.couvertures.forEach((couv, idx) => {
        // Fond alterné (muted vs white)
        if (idx % 2 === 0) {
            doc.setFillColor(248, 249, 250); // muted (210 40% 96%)
            doc.rect(tableX, currentY, tableW, rowH, "F");
        }

        // Bordures (border color)
        doc.setDrawColor(226, 232, 240); // border (214 32% 91%)
        doc.setLineWidth(0.1);
        doc.line(tableX, currentY + rowH, tableX + tableW, currentY + rowH);

        // Contenu
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(38, 43, 51); // foreground
        doc.text(couv.type, tableX + 3, currentY + 4.8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(23, 204, 185); // primary turquoise
        doc.setFontSize(9);
        doc.text(couv.taux, tableX + col1W + 3, currentY + 4.8);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(38, 43, 51); // foreground
        doc.setFontSize(7.5);
        doc.text(couv.ticket, tableX + col1W + col2W + 3, currentY + 4.8);

        currentY += rowH;
    });

    currentY += 6;

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 3 : Période de Validité
    // ═══════════════════════════════════════════════════════════════════════════

    // Titre de section - plus compact
    doc.setFillColor(210, 239, 235); // primary-light
    doc.rect(MARGIN, currentY, A4.w - 2 * MARGIN, 6, "F");
    doc.setFillColor(23, 204, 185); // primary turquoise
    doc.rect(MARGIN, currentY, 0.8, 6, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 204, 185); // primary turquoise
    doc.text("PÉRIODE DE VALIDITÉ", MARGIN + 3, currentY + 4);
    currentY += 8;

    // Grille validité (4 colonnes) - plus compact
    const validiteColW = (A4.w - 2 * MARGIN) / 4;
    drawInfoBox("DATE DE DÉBUT", data.dateDebut || "01/01/2025", MARGIN, currentY, validiteColW - 2);
    drawInfoBox("DATE DE FIN", data.dateFin || "31/12/2025", MARGIN + validiteColW, currentY, validiteColW - 2);
    drawInfoBox("DATE D'ÉDITION", new Date().toLocaleDateString("fr-FR"), MARGIN + 2 * validiteColW, currentY, validiteColW - 2);
    drawInfoBox("EMPLOYEUR", data.employeur, MARGIN + 3 * validiteColW, currentY, validiteColW - 2);

    currentY += 12;

    // ═══════════════════════════════════════════════════════════════════════════
    // AVERTISSEMENT (fond rose opaque #E63B7A du design system) - plus compact
    // ═══════════════════════════════════════════════════════════════════════════

    doc.setFillColor(254, 231, 240); // fond rose très clair (accent/10)
    doc.roundedRect(MARGIN, currentY, A4.w - 2 * MARGIN, 18, 2, 2, "F");

    doc.setFillColor(230, 59, 122); // accent rose
    doc.rect(MARGIN, currentY, 1.5, 18, "F");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 10, 61); // accent dark
    doc.text("IMPORTANT - MENTIONS LÉGALES", MARGIN + 3, currentY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 8, 46); // accent darker
    const warningText = "Cette attestation est valable uniquement auprès des prestataires conventionnés CNAMGS.";
    const warningText2 = "Le système de tiers-payant s'applique selon les tarifs conventionnés. Tout dépassement (GAP)";
    const warningText3 = "reste à votre charge. Toute attestation de droits antérieure est à détruire.";
    doc.text(warningText, MARGIN + 3, currentY + 8);
    doc.text(warningText2, MARGIN + 3, currentY + 11);
    doc.text(warningText3, MARGIN + 3, currentY + 14);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(80, 5, 37); // accent darkest
    doc.text("La loi rend passible d'amende et/ou d'emprisonnement quiconque se rend coupable de fraudes ou de fausses déclarations.", MARGIN + 3, currentY + 17);

    currentY += 22;

    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNATURE - plus compact
    // ═══════════════════════════════════════════════════════════════════════════

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133); // muted-foreground
    doc.text(`Fait à Libreville, le ${new Date().toLocaleDateString("fr-FR")}`, A4.w - MARGIN, currentY, { align: "right" });
    currentY += 8;

    // Ligne de signature
    const signatureX = A4.w - MARGIN - 50;
    doc.setDrawColor(23, 204, 185); // primary turquoise
    doc.setLineWidth(0.4);
    doc.line(signatureX, currentY, A4.w - MARGIN, currentY);

    currentY += 4;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 204, 185); // primary turquoise
    doc.text("Le Directeur Général", (signatureX + A4.w - MARGIN) / 2, currentY, { align: "center" });
    currentY += 3;
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133); // muted-foreground
    doc.text("CNAMGS", (signatureX + A4.w - MARGIN) / 2, currentY, { align: "center" });

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════
    if (opts?.downloadFileName) {
        doc.save(opts.downloadFileName);
    }

    return doc.output("blob");
};
