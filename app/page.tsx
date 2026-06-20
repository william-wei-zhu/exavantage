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
            <p className="section-label mb-4 inline-flex items-center gap-2" style={{ color: "#53284F" }}>
              Exa Vantage · built for
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/kkr.svg" alt="KKR" className="h-[13px] w-auto translate-y-[0.5px]" />
            </p>
            <h1 className="font-heading text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Your vantage on{" "}
              <span className="italic" style={{ color: "#53284F" }}>every deal.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              KKR grows businesses by acquiring the smaller players around them. Exa finds the hidden
              ones, by what they do, the founder-owned companies no database has listed.
            </p>
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
