"use client";

import { useState, useEffect } from "react";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { useDesign } from "../DesignProvider";
import type { TemplateMeta, TemplateCatalog } from "../lib/template-schema";

export default function TemplatePanel() {
  const { loadTemplate } = useDesign();
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fetch template catalog
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/templates/catalog.json");
        if (res.ok) {
          const catalog: TemplateCatalog = await res.json();
          setTemplates(catalog.templates);
        }
      } catch {
        // Templates not available — that's fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLoad = async (meta: TemplateMeta) => {
    setLoadingId(meta.id);
    try {
      await loadTemplate(meta);
    } finally {
      setLoadingId(null);
    }
  };

  // Group by category
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Templates</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-6">
          <LayoutTemplate className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
          <p className="text-xs text-text-tertiary">
            No templates available yet.
          </p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category}>
            <p className="text-xs font-medium text-text-secondary mb-2">
              {category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {templates
                .filter((t) => t.category === category)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleLoad(t)}
                    disabled={loadingId !== null}
                    className="relative text-left p-2 rounded-md border border-border-primary hover:border-text-secondary transition-colors disabled:opacity-50"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="aspect-square bg-bg-secondary rounded mb-1.5 flex items-center justify-center overflow-hidden">
                      {t.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.thumbnail}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <LayoutTemplate className="w-6 h-6 text-text-tertiary" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-text-primary truncate">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-text-tertiary truncate">
                      {t.width}×{t.height}
                    </p>

                    {/* Loading overlay */}
                    {loadingId === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 rounded-md">
                        <Loader2 className="w-5 h-5 animate-spin text-text-primary" />
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
