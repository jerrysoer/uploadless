"use client";

import { Suspense, lazy } from "react";
import ToolTabs from "@/components/tools/ToolTabs";

const PdfMergeSplit = lazy(() => import("@/components/tools/PdfMergeSplit"));
const PDFSigner = lazy(() => import("@/components/PDFSigner"));

const TABS = [
  { id: "merge-split", label: "Merge & Split" },
  { id: "sign", label: "Sign & Fill" },
];

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12 text-text-tertiary text-sm">
      Loading...
    </div>
  );
}

export default function PdfTools() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <Suspense fallback={<TabLoading />}>
          {activeTab === "merge-split" && <PdfMergeSplit />}
          {activeTab === "sign" && <PDFSigner />}
        </Suspense>
      )}
    </ToolTabs>
  );
}
