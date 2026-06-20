import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";
import { ReportExperience } from "@/components/report/report-experience";
import { RecentDecks } from "@/components/report/recent-decks";
import { listRecentReports } from "@/lib/store";

// Refresh the "Recent decks" gallery periodically (newly generated decks appear).
export const revalidate = 60;

export default async function Home() {
  const decks = await listRecentReports(9);

  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-10 md:px-6 md:py-16">
          {/* Hero */}
          <div className="no-print max-w-3xl">
            <h1 className="font-heading text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Your vantage on{" "}
              <span className="italic" style={{ color: "#53284F" }}>every deal.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              KKR grows businesses by acquiring the smaller players around them. Exa finds the hidden
              ones not in PitchBook.
            </p>
          </div>

          <div className="mt-10">
            <ReportExperience />
          </div>

          <RecentDecks decks={decks} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
