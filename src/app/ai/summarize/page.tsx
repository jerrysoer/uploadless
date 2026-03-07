"use client";

import { Suspense } from "react";
import AISummarizer from "@/components/tools/AISummarizer";

export default function SummarizePage() {
  return (
    <Suspense>
      <AISummarizer />
    </Suspense>
  );
}
