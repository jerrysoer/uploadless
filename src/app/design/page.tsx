"use client";

import { DesignProvider } from "@/components/design/DesignProvider";
import DesignEditor from "@/components/design/DesignEditor";

export default function DesignPage() {
  return (
    <DesignProvider>
      <DesignEditor />
    </DesignProvider>
  );
}
