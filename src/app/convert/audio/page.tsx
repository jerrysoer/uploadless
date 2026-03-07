import { Metadata } from "next";
import ConverterTabs from "@/components/ConverterTabs";
import AudioConverter from "@/components/AudioConverter";

export const metadata: Metadata = {
  title: "Audio Converter — BrowserShip",
  description: "Convert audio between MP3, WAV, OGG, AAC, FLAC. Adjust bitrate. All processing happens locally.",
};

export default function AudioPage() {
  return (
    <div className="space-y-6">
      <ConverterTabs />
      <div>
        <h1 className="font-heading font-bold text-2xl mb-1">Audio Converter</h1>
        <p className="text-text-secondary text-sm">
          Transcode audio files. Supports MP3, WAV, OGG, AAC, FLAC, M4A. Adjust bitrate and quality.
        </p>
      </div>
      <AudioConverter />
    </div>
  );
}
