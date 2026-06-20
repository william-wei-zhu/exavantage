import { ExaHeader } from "@/components/exa-header";
import { ExaFooter } from "@/components/exa-footer";
import { ReportExperience } from "@/components/report/report-experience";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-10 md:px-6 md:py-16">
          {/* Hero */}
          <div className="no-print max-w-3xl">
            <p className="section-label mb-4 text-primary">
              Built on Exa · for financial-services teams
            </p>
            <h1 className="font-heading text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Your vantage point on{" "}
              <span className="italic text-primary">every market.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Pick your firm, type a company or a sector thesis, and Exa Vantage
              returns a branded research report you could walk into a partner
              meeting with. It compresses the first 80% of the landscaping
              legwork, so the analyst keeps the judgment.
            </p>
          </div>

          <div className="mt-10">
            <ReportExperience />
          </div>
        </div>
      </main>
      <ExaFooter />
    </div>
  );
}
