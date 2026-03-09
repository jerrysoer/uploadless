import { ImageResponse } from "next/og";

export const alt = "Uploadless — Privacy-First Browser Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0D12",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #11151C 0%, #0A0D12 70%)",
        }}
      >
        {/* Monogram accent */}
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#3B82F6",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          U
        </span>

        {/* Accent line */}
        <div
          style={{
            width: 48,
            height: 2,
            backgroundColor: "#3B82F6",
            marginBottom: 28,
            borderRadius: 1,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#E6EAF0",
            letterSpacing: "3px",
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          Uploadless
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#8D97AB",
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          Privacy-First Browser Tools
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#5B6680",
            letterSpacing: "2px",
          }}
        >
          Zero uploads. Zero tracking.
        </div>
      </div>
    ),
    { ...size }
  );
}
