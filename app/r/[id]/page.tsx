import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";
import { ReportDeck } from "@/components/report/report-deck";
import { getReport } from "@/lib/store";
import { firmById } from "@/lib/firms";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: "Report not found" };
  const firm = firmById(report.firmId);
  const title =
    report.mode === "company"
      ? `${report.anchor?.name ?? report.query} — Competitive Landscape`
      : `${report.query} — Market Landscape`;
  const desc = `A market-intelligence report prepared for ${firm.name}, powered by Exa.`;
  return {
    title,
    description: desc,
    openGraph: { title: `${title} · Exa Vantage`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `${title} · Exa Vantage`, description: desc },
    robots: { index: false, follow: false },
  };
}

export default async function SharedReportPage({ params }: Params) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();
  const firm = firmById(report.firmId);

  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-10 md:px-6 md:py-14">
          <ReportDeck firm={firm} report={report} shareId={report.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
