"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import BaseConverter from "@/components/tools/BaseConverter";
import EpochConverter from "@/components/tools/EpochConverter";

const TABS = [
  { id: "bases", label: "Bases" },
  { id: "epoch", label: "Epoch" },
];

export default function NumbersPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "bases" && <BaseConverter />}
          {activeTab === "epoch" && <EpochConverter />}
        </>
      )}
    </ToolTabs>
  );
}
