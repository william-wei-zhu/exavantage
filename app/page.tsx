import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";
import { ReportExperience } from "@/components/report/report-experience";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-10 md:px-6 md:py-16">
          {/* Hero */}
          <div className="no-print max-w-3xl">
            <h1 className="font-heading text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Your vantage point on{" "}
              <span className="italic text-primary">every market.</span>
            </h1>
          </div>

          <div className="mt-10">
            <ReportExperience />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
