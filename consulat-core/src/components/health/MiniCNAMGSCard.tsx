import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface MiniCNAMGSCardProps {
    className?: string;
    onClick?: () => void;
}

/**
 * Mini CNAMGS card for wallet stack display.
 * Uses the same SVG template as the full CNAMGSCard but renders at a smaller scale.
 */
export const MiniCNAMGSCard = ({ className, onClick }: MiniCNAMGSCardProps) => {
    const [svgContent, setSvgContent] = useState<string>('');

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                const cacheBuster = `v1_${Date.now()}`;
                const templateResponse = await fetch(`/cnamgs_card_template.svg?${cacheBuster}`);
                const templateText = await templateResponse.text();

                // Parse the SVG
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(templateText, 'image/svg+xml');
                const svg = svgDoc.documentElement as unknown as SVGElement;

                // Set basic placeholder data
                const setText = (id: string, value: string = '') => {
                    const node = svg.querySelector('#' + CSS.escape(id));
                    if (node) node.textContent = value;
                };

                // Place text fields in position
                const setFieldPosition = (id: string, x: number, y: number, fontSize: number = 32) => {
                    const node = svg.querySelector('#' + CSS.escape(id));
                    if (node) {
                        node.setAttribute('x', String(x));
                        node.setAttribute('y', String(y));
                        node.setAttribute('font-size', String(fontSize));
                        node.setAttribute('font-weight', 'bold');
                    }
                };

                // Card number
                const cardNumberNode = svg.querySelector('#field-card-number');
                if (cardNumberNode) {
                    cardNumberNode.setAttribute('x', '501');
                    cardNumberNode.setAttribute('y', '288');
                    cardNumberNode.setAttribute('text-anchor', 'start');
                    cardNumberNode.setAttribute('font-size', '34');
                    cardNumberNode.setAttribute('font-weight', '900');
                }

                // Field positions
                setFieldPosition('field-name', 62, 442);
                setFieldPosition('field-given-names', 62, 524);
                setFieldPosition('field-birthdate', 62, 606);
                setFieldPosition('field-sex', 511, 606);

                // Set placeholder data
                setText('field-card-number', '001-234-567-8');
                setText('field-name', 'DUPONT');
                setText('field-given-names', 'JEAN');
                setText('field-birthdate', '15/03/1990');
                setText('field-sex', 'M');

                // Serialize
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svg);
                setSvgContent(svgString);
            } catch (error) {
                console.error("MiniCNAMGSCard: Error loading template:", error);
            }
        };

        loadTemplate();
    }, []);

    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-xl overflow-hidden shadow-lg cursor-pointer",
                "hover:shadow-xl transition-shadow",
                "border border-slate-200",
                "bg-white", // Pure white to match SVG background
                className
            )}
            style={{ aspectRatio: "85 / 55" }}
        >
            {svgContent ? (
                <div
                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            ) : (
                // Fallback placeholder while loading - matches card white bg
                <div className="w-full h-full bg-white flex items-center justify-center gap-2">
                    <div className="w-6 h-4 bg-[#009640] rounded-sm" />
                    <span className="text-[#009640] text-xs font-bold">CNAMGS</span>
                </div>
            )}
        </div>
    );
};
