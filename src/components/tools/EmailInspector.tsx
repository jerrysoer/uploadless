"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import TrackingPixelDetector from "@/components/tools/TrackingPixelDetector";
import EmailHeaderAnalyzer from "@/components/tools/EmailHeaderAnalyzer";

const TABS = [
  { id: "tracking", label: "Tracking Pixels" },
  { id: "headers", label: "Email Headers" },
];

export default function EmailInspector() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "tracking" && <TrackingPixelDetector />}
          {activeTab === "headers" && <EmailHeaderAnalyzer />}
        </>
      )}
    </ToolTabs>
  );
}
