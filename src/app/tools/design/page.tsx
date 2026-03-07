"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import ContrastChecker from "@/components/tools/ContrastChecker";
import GradientGenerator from "@/components/tools/GradientGenerator";
import ColorPalette from "@/components/tools/ColorPalette";

const TABS = [
  { id: "contrast", label: "Contrast" },
  { id: "gradient", label: "Gradient" },
  { id: "palette", label: "Palette" },
];

export default function DesignToolsPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "contrast" && <ContrastChecker />}
          {activeTab === "gradient" && <GradientGenerator />}
          {activeTab === "palette" && <ColorPalette />}
        </>
      )}
    </ToolTabs>
  );
}
