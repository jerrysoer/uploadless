"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeftRight, Lock, Zap, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScanInput from "@/components/ScanInput";
import ScanProgress from "@/components/ScanProgress";
import GradeReveal from "@/components/GradeReveal";
import AuditReport from "@/components/AuditReport";
import ReportCard from "@/components/ReportCard";
import type { AuditResult, ScanError } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

export default function HomePage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scanDomain, setScanDomain] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(url: string) {
    setIsScanning(true);
    setResult(null);
    setError(null);

    // Extract domain for display during scan
    try {
      const parsed = new URL(url.includes("://") ? url : `https://${url}`);
      setScanDomain(parsed.hostname);
    } catch {
      setScanDomain(url);
    }

    trackEvent("scan_started", { url });

    try {
      const res = await fetch("/api/audit/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const err = data as ScanError;
        setError(err.error);
        trackEvent("scan_error", { url, code: err.code ?? "unknown" });
        return;
      }

      setResult(data.result);
      trackEvent("scan_completed", {
        domain: data.result.domain,
        grade: data.result.grade,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pt-16 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4 leading-tight">
              How much does your favorite tool{" "}
              <span className="text-accent">really</span> know about you?
            </h1>
            <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
              Scan any free online tool to see how many cookies, trackers, and
              ad networks it loads. Get an instant privacy grade and shareable
              report card.
            </p>

            <ScanInput onScan={handleScan} isScanning={isScanning} />

            {error && (
              <p className="text-grade-f text-sm mt-4">{error}</p>
            )}
          </div>
        </section>

        {/* Scan progress */}
        {isScanning && (
          <section className="px-6 pb-12">
            <ScanProgress domain={scanDomain} isActive={isScanning} />
          </section>
        )}

        {/* Results */}
        {result && (
          <section className="px-6 pb-16">
            <div className="max-w-4xl mx-auto">
              <GradeReveal
                grade={result.grade}
                score={result.scores.total}
                domain={result.domain}
              />

              <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-8">
                <AuditReport result={result} />
                <div className="lg:sticky lg:top-8 lg:self-start">
                  <ReportCard result={result} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Converter CTA — only show when no scan result */}
        {!result && !isScanning && (
          <section className="px-6 pb-16">
            <div className="max-w-4xl mx-auto">
              <div className="border-t border-border pt-12">
                <div className="text-center mb-8">
                  <h2 className="font-heading font-semibold text-2xl mb-2">
                    Convert files without uploading them
                  </h2>
                  <p className="text-text-secondary">
                    Images, documents, and audio — all processed locally in your
                    browser.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <a
                    href="/convert/images"
                    className="group bg-bg-surface border border-border rounded-xl p-6 hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Zap className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading font-semibold">Images</h3>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      PNG, JPG, WebP, AVIF — resize, compress, convert
                    </p>
                  </a>

                  <a
                    href="/convert/documents"
                    className="group bg-bg-surface border border-border rounded-xl p-6 hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Eye className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading font-semibold">Documents</h3>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      PDF, DOCX, CSV, TXT — convert between formats
                    </p>
                  </a>

                  <a
                    href="/convert/audio"
                    className="group bg-bg-surface border border-border rounded-xl p-6 hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Lock className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading font-semibold">Audio</h3>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      MP3, WAV, OGG, AAC — transcode, trim, adjust bitrate
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
