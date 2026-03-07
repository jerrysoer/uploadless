"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import MarkdownEditor from "@/components/tools/MarkdownEditor";
import SvgToReact from "@/components/tools/SvgToReact";
import CodeScreenshot from "@/components/tools/CodeScreenshot";

const TABS = [
  { id: "markdown", label: "Markdown" },
  { id: "svg-to-react", label: "SVG \u2192 React" },
  { id: "screenshot", label: "Screenshot" },
];

export default function CodeToolsPage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "markdown" && <MarkdownEditor />}
          {activeTab === "svg-to-react" && <SvgToReact />}
          {activeTab === "screenshot" && <CodeScreenshot />}
        </>
      )}
    </ToolTabs>
  );
}
