import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eraser, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function SignaturePad({ onSignatureChange, width = 400, height = 200, className = "" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = "#1a365d";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw signature line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = "#1a365d";
    ctx.lineWidth = 2;
  }, [width, height]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        onSignatureChange(canvas.toDataURL("image/png"));
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Clear and redraw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Redraw signature line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = "#1a365d";
    ctx.lineWidth = 2;

    setHasSignature(false);
    onSignatureChange(null);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      onSignatureChange(canvas.toDataURL("image/png"));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair touch-none w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground/50 text-sm">Signez ici</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Effacer
        </Button>
        <motion.div
          initial={false}
          animate={{ scale: hasSignature ? 1 : 0.9, opacity: hasSignature ? 1 : 0.5 }}
        >
          <Button
            type="button"
            size="sm"
            onClick={confirmSignature}
            disabled={!hasSignature}
          >
            <Check className="h-4 w-4 mr-2" />
            Valider la signature
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
