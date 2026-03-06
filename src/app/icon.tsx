import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0E17",
          borderRadius: 6,
        }}
      >
        {/* Shield shape with local pin dot */}
        <svg
          width="22"
          height="24"
          viewBox="0 0 22 24"
          fill="none"
        >
          {/* Shield outline */}
          <path
            d="M11 1L2 5v7c0 5.25 3.85 10.15 9 11.25 5.15-1.1 9-6 9-11.25V5L11 1z"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
          />
          {/* Local pin dot */}
          <circle cx="11" cy="11" r="3" fill="#3B82F6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
