import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
    className?: string;
    text?: string;
}

export function ImagePlaceholder({ className, text = "Image non disponible" }: ImagePlaceholderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center bg-muted text-muted-foreground", className)}>
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
}
