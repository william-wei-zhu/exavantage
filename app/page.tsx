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
            <h1 className="hero-tagline font-bold" style={{ fontFamily: "var(--font-hanken)" }}>
              <span className="hero-w" style={{ animationDelay: "80ms" }}>
                <span>Your</span>
              </span>
              <span className="hero-w" style={{ animationDelay: "230ms" }}>
                <span>vantage</span>
              </span>
              <span className="hero-w" style={{ animationDelay: "380ms" }}>
                <span>on</span>
              </span>
              <span className="hero-w" style={{ animationDelay: "500ms" }}>
                <span>every</span>
              </span>
              <span className="hero-w hero-accent" style={{ animationDelay: "650ms" }}>
                <span>deal.</span>
              </span>
              <span className="hero-rule" aria-hidden />
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              KKR grows a company by absorbing the smaller players around it for scale. Exa finds the
              hidden ones not in PitchBook, so the deal team knows who to buy.
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
