import { ImageResponse } from "next/og";

export const alt = "BrowserShip — Developer & Privacy Tools";
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
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            border: "3px solid #F87171",
            borderRadius: 18,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#F87171",
              lineHeight: 1,
            }}
          >
            /
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#E5E0DB",
            letterSpacing: "-1px",
            marginBottom: 16,
          }}
        >
          BrowserShip
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
          Local-first productivity suite — all in your browser
        </div>
      </div>
    ),
    { ...size }
  );
}
