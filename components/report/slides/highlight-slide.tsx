import type { Company } from "@/lib/types";
import type { SlideProps } from "./bits";
import { Favicon, ExaEdge, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { stageBucket } from "@/lib/metrics";

/**
 * The lens-specific highlight. IPO → late-stage candidates; buyout → platform vs
 * add-on split; landscape → emerging / white space. Carries the Exa-edge framing.
 */
export function HighlightSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const cos = report.companies;

  let body: React.ReactNode;

  if (firm.lens === "ipo") {
    const candidates = cos
      .filter((c) => ["Growth", "Late", "Public"].includes(stageBucket(c.stage)) || c.funding)
      .slice(0, 8);
    const list = candidates.length ? candidates : cos.slice(0, 6);
    body = <CardList companies={list} firm={firm} note={(c) => [c.stage, c.funding].filter(Boolean).join(" · ")} />;
  } else if (firm.lens === "buyout") {
    const platform = cos.filter((c) => ["Growth", "Late", "Public"].includes(stageBucket(c.stage))).slice(0, 4);
    const platformSet = new Set(platform.map((c) => c.domain));
    const addons = cos.filter((c) => !platformSet.has(c.domain)).slice(0, 8);
    body = (
      <div className="grid gap-6 sm:grid-cols-2">
        <Column title="Platform candidates" t={t}>
          <CardList companies={platform.length ? platform : cos.slice(0, 3)} firm={firm} note={(c) => [c.stage, c.employees].filter(Boolean).join(" · ")} />
        </Column>
        <Column title="Add-on targets" t={t}>
          <CardList companies={addons} firm={firm} compact note={(c) => c.region || c.stage || ""} />
        </Column>
      </div>
    );
  } else {
    const emerging = (report.emerging.length ? report.emerging : cos.filter((c) => c.emerging)).slice(0, 8);
    const list = emerging.length ? emerging : cos.slice(0, 6);
    body = <CardList companies={list} firm={firm} note={(c) => [c.foundedYear ? `Founded ${c.foundedYear}` : "", c.stage].filter(Boolean).join(" · ")} />;
  }

  return (
    <SlideFrame firm={firm} lens={lens} title={lens.highlightTitle}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: t.headingFont, color: t.primary }}>
        {lens.highlightTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-snug" style={{ color: `${t.ink}99` }}>{lens.highlightIntro}</p>
      <div className="mt-3">
        <ExaEdge accent={t.primary}>{lens.exaEdge}</ExaEdge>
      </div>
      <div className="mt-6">{body}</div>
    </SlideFrame>
  );
}

function Column({ title, t, children }: { title: string; t: SlideProps["firm"]["theme"]; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: t.primary }}>
        <span className="h-2 w-2 rounded-full" style={{ background: t.primary, ...PRINT_EXACT }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function CardList({
  companies,
  firm,
  note,
  compact = false,
}: {
  companies: Company[];
  firm: SlideProps["firm"];
  note: (c: Company) => string;
  compact?: boolean;
}) {
  const t = firm.theme;
  return (
    <div className={`grid gap-2.5 ${compact ? "" : "sm:grid-cols-2"}`}>
      {companies.map((c) => (
        <div key={c.domain} className="rounded-lg border p-3" style={{ borderColor: `${t.ink}15` }}>
          <div className="flex items-center gap-2">
            <Favicon domain={c.domain} size={18} />
            <span className="text-[14px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
            {c.emerging && <span className="ml-auto text-[9px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>new</span>}
          </div>
          {!compact && <p className="mt-1 text-[12.5px] leading-snug" style={{ color: `${t.ink}b0` }}>{c.oneLiner}</p>}
          {note(c) && <p className="mt-1 text-[11.5px] font-medium tabular-nums" style={{ color: t.primary }}>{note(c)}</p>}
        </div>
      ))}
    </div>
  );
}
