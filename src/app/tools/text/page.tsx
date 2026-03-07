"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import WordCounter from "@/components/tools/WordCounter";
import CaseConverter from "@/components/tools/CaseConverter";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";

const TABS = [
  { id: "count", label: "Count" },
  { id: "case", label: "Case" },
  { id: "lorem", label: "Lorem" },
];

export default function TextUtilitiesPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "count" && <WordCounter />}
          {activeTab === "case" && <CaseConverter />}
          {activeTab === "lorem" && <LoremIpsumGenerator />}
        </>
      )}
    </ToolTabs>
  );
}
