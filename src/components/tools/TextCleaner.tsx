"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import ClipboardCleaner from "@/components/tools/ClipboardCleaner";
import InvisibleCharDetector from "@/components/tools/InvisibleCharDetector";

const TABS = [
  { id: "strip", label: "Strip Formatting" },
  { id: "detect", label: "Detect Hidden Chars" },
];

export default function TextCleaner() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "strip" && <ClipboardCleaner />}
          {activeTab === "detect" && <InvisibleCharDetector />}
        </>
      )}
    </ToolTabs>
  );
}
