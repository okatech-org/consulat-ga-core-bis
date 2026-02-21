import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface ImageCropDialogProps {
	open: boolean;
	imageFile: File | null;
	onClose: () => void;
	onCropComplete: (croppedFile: File) => void;
}

export function ImageCropDialog({
	open,
	imageFile,
	onClose,
	onCropComplete,
}: ImageCropDialogProps) {
	const { t } = useTranslation();
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Create object URL only when file changes
	const imageUrl = imageFile ? URL.createObjectURL(imageFile) : "";

	const handleCropComplete = useCallback(
		(_croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	const processCrop = async () => {
		if (!imageFile || !imageUrl || !croppedAreaPixels) return;

		try {
			setIsProcessing(true);
			const croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels);

			// Create a new File from the Blob
			const croppedFile = new File([croppedImageBlob], imageFile.name, {
				type: "image/jpeg",
				lastModified: Date.now(),
			});

			onCropComplete(croppedFile);
			onClose();
		} catch (e) {
			console.error("Error cropping image:", e);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{t("register.documents.cropPhoto", "Recadrer la photo")}
					</DialogTitle>
				</DialogHeader>

				<div className="relative h-[300px] w-full bg-black/5 rounded-md overflow-hidden">
					{imageUrl && (
						<Cropper
							image={imageUrl}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={handleCropComplete}
						/>
					)}
				</div>

				<div className="py-4 flex items-center gap-4">
					<span className="text-sm font-medium">Zoom</span>
					<Slider
						value={[zoom]}
						min={1}
						max={3}
						step={0.1}
						onValueChange={(value) => setZoom(value[0])}
						className="flex-1"
					/>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isProcessing}>
						{t("common.cancel", "Annuler")}
					</Button>
					<Button onClick={processCrop} disabled={isProcessing}>
						{isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("common.confirm", "Confirmer")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Utility to extract the cropped portion
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("No 2d context");
	}

	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height,
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(file: Blob | null) => {
				if (file) resolve(file);
				else reject(new Error("Canvas is empty"));
			},
			"image/jpeg",
			0.95,
		);
	});
}

function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});
}
