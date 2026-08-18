import { caseStudies } from "../../data/caseStudies";
import { SectionHeading } from "../ui/SectionHeading";
import { CaseStudyCard } from "./CaseStudyCard";

export function CaseStudies() {
  return (
    <section id="case-studies" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Case studies"
          title="From advocacy to outcomes"
          description="Placeholder narratives showing how advocate programs move from first share to attributed pipeline. Replace with verified customer stories when ready."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
