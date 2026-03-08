"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import BaseConverter from "@/components/tools/BaseConverter";
import EpochConverter from "@/components/tools/EpochConverter";
import UnitConverter from "@/components/tools/UnitConverter";

const TABS = [
  { id: "bases", label: "Bases" },
  { id: "epoch", label: "Epoch" },
  { id: "units", label: "Units" },
];

export default function NumbersPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "bases" && <BaseConverter />}
          {activeTab === "epoch" && <EpochConverter />}
          {activeTab === "units" && <UnitConverter />}
        </>
      )}
    </ToolTabs>
  );
}
