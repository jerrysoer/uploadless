import { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import type { AuditResult } from "@/lib/types";
import AuditPageClient from "./client";

interface Props {
  params: Promise<{ domain: string }>;
}

async function getAudit(slug: string): Promise<AuditResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("sl_audits")
    .select("*")
    .eq("id", slug)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    domain: data.domain,
    displayUrl: data.display_url,
    grade: data.grade,
    scores: data.scores,
    scan: data.scan,
    cachedAt: data.cached_at,
    expiresAt: data.expires_at,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: slug } = await params;
  const audit = await getAudit(slug);
  const displayDomain = slug.replace(/-/g, ".");

  if (!audit) {
    return { title: `Audit: ${displayDomain} — ShipLocal` };
  }

  const title = `${displayDomain} gets a ${audit.grade} — ShipLocal Privacy Audit`;
  const description = `${audit.scan.cookies.thirdParty} third-party cookies, ${audit.scan.thirdPartyDomains.total} third-party domains, and ${audit.scan.trackers.advertising.length} ad networks found.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og/${slug}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${slug}`],
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { domain: slug } = await params;
  const audit = await getAudit(slug);

  return <AuditPageClient audit={audit} slug={slug} />;
}
