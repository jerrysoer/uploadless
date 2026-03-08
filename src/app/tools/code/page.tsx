"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import MarkdownEditor from "@/components/tools/MarkdownEditor";
import SvgToReact from "@/components/tools/SvgToReact";

const TABS = [
  { id: "markdown", label: "Markdown" },
  { id: "svg-to-react", label: "SVG \u2192 React" },
];

export default function CodeToolsPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "markdown" && <MarkdownEditor />}
          {activeTab === "svg-to-react" && <SvgToReact />}
        </>
      )}
    </ToolTabs>
  );
}
