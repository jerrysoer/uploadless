"use client";

import ToolTabs from "@/components/tools/ToolTabs";
import Base64Tool from "@/components/tools/Base64Tool";
import HtmlEntityEncoder from "@/components/tools/HtmlEntityEncoder";
import UrlParser from "@/components/tools/UrlParser";

const TABS = [
  { id: "base64", label: "Base64" },
  { id: "html-entities", label: "HTML Entities" },
  { id: "url", label: "URL" },
];

export default function EncodeDecodePage() {
  return (
    <ToolTabs tabs={TABS}>
      {(activeTab) => (
        <>
          {activeTab === "base64" && <Base64Tool />}
          {activeTab === "html-entities" && <HtmlEntityEncoder />}
          {activeTab === "url" && <UrlParser />}
        </>
      )}
    </ToolTabs>
  );
}
