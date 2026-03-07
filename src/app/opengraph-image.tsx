import { ImageResponse } from "next/og";

export const alt = "Uploadless — browser tools, no cloud required";
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
          backgroundColor: "#0F0F0F",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #1A1918 0%, #0F0F0F 70%)",
        }}
      >
        {/* Monogram accent */}
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#F87171",
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
            backgroundColor: "#F87171",
            marginBottom: 28,
            borderRadius: 1,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#E5E0DB",
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
            color: "#8C8580",
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          browser tools, no cloud required
        </div>
      </div>
    ),
    { ...size }
  );
}
