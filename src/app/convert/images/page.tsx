import { Metadata } from "next";
import ConverterTabs from "@/components/ConverterTabs";
import ImageConverter from "@/components/ImageConverter";

export const metadata: Metadata = {
  title: "Image Converter — Uploadless",
  description: "Convert images between PNG, JPG, WebP, AVIF and more. All processing happens locally in your browser.",
};

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <ConverterTabs />
      <div>
        <h1 className="font-heading font-bold text-2xl mb-1">Image Converter</h1>
        <p className="text-text-secondary text-sm">
          Convert, resize, and compress images. Supports PNG, JPG, WebP, AVIF, GIF, BMP, TIFF.
        </p>
      </div>
      <ImageConverter />
    </div>
  );
}
