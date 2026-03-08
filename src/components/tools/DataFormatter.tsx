"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import JsonFormatter from "@/components/tools/JsonFormatter";
import FormatConverter from "@/components/tools/FormatConverter";

const TABS = [
  { id: "format", label: "Format & Validate" },
  { id: "convert", label: "Convert" },
];

export default function DataFormatter() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "format" && <JsonFormatter />}
          {activeTab === "convert" && <FormatConverter />}
        </>
      )}
    </ToolTabs>
  );
}
