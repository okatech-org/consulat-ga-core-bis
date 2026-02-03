/**
 * FolderIcon - Dossier Manila 3D Réaliste
 * 
 * Design inspiré des dossiers manila physiques avec:
 * - Perspective 3D avec rotation
 * - Documents PDF visibles à l'ouverture
 * - Animation fluide d'ouverture/fermeture
 * - Badge compteur de documents
 * 
 * États:
 * - closed-empty: Dossier vide (toujours semi-ouvert, couleur carton)
 * - closed-filled: Dossier avec fichiers, fermé
 * - open-filled: Dossier avec fichiers, ouvert
 */

import React, { useState, useEffect } from 'react';

interface FolderIconProps {
    type: 'closed-empty' | 'closed-filled' | 'open-filled';
    size?: number;
    color?: string;
    documentCount?: number;
    className?: string;
}

// Configuration des couleurs par catégorie
export const FOLDER_ICON_COLORS: Record<string, string> = {
    identity: '#3b82f6',      // blue
    civil_status: '#8b5cf6',  // violet
    residence: '#10b981',     // emerald
    education: '#f59e0b',     // amber
    work: '#0ea5e9',          // sky
    health: '#ef4444',        // red
    vehicle: '#6366f1',       // indigo
    other: '#64748b',         // slate
    administrative: '#3b82f6',
    financial: '#10b981',
    medical: '#ef4444',
    professional: '#f59e0b'
};

// Couleur carton pour dossiers vides
const CARTON = {
    light: '#f0e4c4',
    base: '#e8d5a3',
    medium: '#dcc88a',
    dark: '#c9ad5c',
    shadow: '#b89b4a',
};

// Génère les variantes de couleur à partir d'une couleur de base
function generateColorVariants(hexColor: string) {
    return {
        light: adjustColor(hexColor, 40),
        base: hexColor,
        medium: adjustColor(hexColor, -10),
        dark: adjustColor(hexColor, -30),
        shadow: adjustColor(hexColor, -50),
    };
}

function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
    type,
    size = 80,
    color = '#4a90d9',
    documentCount = 0,
    className = ''
}) => {
    const [showDocs, setShowDocs] = useState(false);

    const isVide = type === 'closed-empty';
    const estOuvert = isVide ? true : type === 'open-filled';

    // Gérer l'affichage des documents pendant l'animation
    useEffect(() => {
        if (!isVide && estOuvert) {
            const timer = setTimeout(() => setShowDocs(true), 200);
            return () => clearTimeout(timer);
        } else {
            setShowDocs(false);
        }
    }, [estOuvert, isVide]);

    // Sélection des couleurs
    const c = isVide ? CARTON : generateColorVariants(color);

    // Angles d'ouverture
    // Vide: -25° (semi-ouvert)
    // Fermé avec docs: -5°
    // Ouvert avec docs: -50°
    const angleOuverture = isVide ? -25 : (estOuvert ? -50 : -5);

    // Dimensions proportionnelles
    const scale = size / 80;
    const largeurFaceArriere = 60 * scale;
    const largeurExtension = 6 * scale;
    const largeurTotale = largeurFaceArriere + largeurExtension;
    const hauteurTotale = 90 * scale;
    const hauteurExtension = 36 * scale;

    return (
        <div
            className={`relative ${className}`}
            style={{
                perspective: '500px',
                width: size,
                height: size * 1.15,
            }}
        >
            <div
                className="relative h-full w-full"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* ===== PARTIE ARRIÈRE DU DOSSIER ===== */}
                <div
                    className="absolute"
                    style={{
                        width: largeurTotale,
                        height: hauteurTotale,
                        left: '8%',
                        top: '8%',
                        transform: 'translateZ(-6px)',
                    }}
                >
                    <svg width="100%" height="100%" viewBox={`0 0 ${largeurTotale / scale} ${hauteurTotale / scale}`}>
                        <defs>
                            <linearGradient id={`backGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={c.dark} />
                                <stop offset="100%" stopColor={c.medium} />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 0 2.5 
                               Q 0 0 2.5 0 
                               L ${60 - 2.5} 0
                               Q ${60} 0 ${60} 2.5
                               L ${60} ${90 - 36}
                               L ${66 - 2.5} ${90 - 36}
                               Q ${66} ${90 - 36} ${66} ${90 - 36 + 2.5}
                               L ${66} ${90 - 2.5}
                               Q ${66} ${90} ${66 - 2.5} ${90}
                               L 2.5 ${90}
                               Q 0 ${90} 0 ${90 - 2.5}
                               Z`}
                            fill={`url(#backGrad-${color})`}
                        />
                    </svg>
                </div>

                {/* ===== TRANCHE GAUCHE ===== */}
                <div
                    className="absolute"
                    style={{
                        width: 3 * scale,
                        height: 80 * scale,
                        left: '6%',
                        top: '12%',
                        background: `linear-gradient(to right, ${c.shadow}, ${c.dark})`,
                        borderRadius: '1px 0 0 1px',
                        transform: 'translateZ(-4px)',
                    }}
                />

                {/* ===== DOCUMENTS PDF ===== */}
                {!isVide && (
                    <div
                        className="absolute transition-all duration-300 ease-out"
                        style={{
                            left: '25%',
                            top: '15%',
                            transform: 'translateZ(-2px)',
                            opacity: showDocs ? 1 : 0,
                        }}
                    >
                        {[...Array(Math.min(documentCount || 1, 2))].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-white border border-slate-200 rounded-sm"
                                style={{
                                    width: 36 * scale,
                                    height: 50 * scale,
                                    left: i * 2 * scale,
                                    top: i * 3 * scale,
                                    transform: `rotate(${-1 + i * 0.5}deg)`,
                                    boxShadow: '1px 2px 4px rgba(0,0,0,0.1)',
                                    transition: `opacity 0.3s ease ${i * 50}ms`,
                                }}
                            >
                                {/* Lignes de texte */}
                                <div className="p-1.5 space-y-1">
                                    <div className="h-0.5 bg-slate-300 rounded w-4/5" />
                                    <div className="h-0.5 bg-slate-200 rounded w-3/5" />
                                    <div className="h-0.5 bg-slate-200 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== PARTIE AVANT DU DOSSIER (RABAT) ===== */}
                <div
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                        width: largeurTotale,
                        height: hauteurTotale,
                        left: '12%',
                        top: '8%',
                        transformOrigin: 'left center',
                        transform: `rotateY(${angleOuverture}deg) translateZ(2px)`,
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${largeurTotale / scale} ${hauteurTotale / scale}`}
                        style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.15))' }}
                    >
                        <defs>
                            <linearGradient id={`frontGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={c.light} />
                                <stop offset="40%" stopColor={c.base} />
                                <stop offset="100%" stopColor={c.medium} />
                            </linearGradient>
                        </defs>

                        <path
                            d={`M 0 2.5 
                               Q 0 0 2.5 0 
                               L ${60 - 2.5} 0
                               Q ${60} 0 ${60} 2.5
                               L ${60} ${90 - 36}
                               L ${66 - 2.5} ${90 - 36}
                               Q ${66} ${90 - 36} ${66} ${90 - 36 + 2.5}
                               L ${66} ${90 - 2.5}
                               Q ${66} ${90} ${66 - 2.5} ${90}
                               L 2.5 ${90}
                               Q 0 ${90} 0 ${90 - 2.5}
                               Z`}
                            fill={`url(#frontGrad-${color})`}
                            stroke={c.dark}
                            strokeWidth="0.3"
                        />

                        {/* Reflet lumineux */}
                        <path
                            d={`M 0 2.5 
                               Q 0 0 2.5 0 
                               L 12 0
                               L 12 ${90}
                               L 2.5 ${90}
                               Q 0 ${90} 0 ${90 - 2.5}
                               Z`}
                            fill={c.light}
                            opacity="0.4"
                        />
                    </svg>

                    {/* Badge VIDE */}
                    {isVide && (
                        <div
                            className="absolute px-1.5 py-0.5 bg-amber-100/90 text-amber-700 rounded text-[8px] font-semibold border border-amber-300"
                            style={{
                                bottom: '12%',
                                right: '8%',
                            }}
                        >
                            Vide
                        </div>
                    )}
                </div>

                {/* ===== OMBRE PORTÉE ===== */}
                <div
                    className="absolute rounded-full blur-md"
                    style={{
                        width: '70%',
                        height: 8 * scale,
                        left: '15%',
                        bottom: '2%',
                        backgroundColor: 'rgba(0,0,0,0.15)',
                    }}
                />
            </div>
        </div>
    );
};

export default FolderIcon;
