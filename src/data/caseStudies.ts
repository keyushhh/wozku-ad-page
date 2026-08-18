export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudy {
  id: string;
  company: string;
  industry: string;
  headline: string;
  summary: string;
  metrics: CaseStudyMetric[];
  tags: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: "demo-enterprise",
    company: "Demo Enterprise Co.",
    industry: "B2B SaaS",
    headline: "Launch week reach grew 6× without increasing paid spend",
    summary:
      "A fictional enterprise team activated employees and partners around a product launch, replacing rented impressions with trusted advocate distribution.",
    metrics: [
      { label: "Organic reach", value: "1.2M" },
      { label: "Attributed shares", value: "4,820" },
      { label: "Pipeline influenced", value: "$2.4M" },
    ],
    tags: ["Product launch", "Employee advocacy"],
  },
  {
    id: "demo-events",
    company: "Demo Events Group",
    industry: "Events & communities",
    headline: "Event advocacy drove 3× more registrations than email alone",
    summary:
      "Placeholder case study showing how speakers, sponsors, and attendees amplified a flagship conference through one coordinated share link.",
    metrics: [
      { label: "Registrations", value: "12.4K" },
      { label: "Share rate", value: "68%" },
      { label: "Cost per registration", value: "-41%" },
    ],
    tags: ["Events", "Partner network"],
  },
  {
    id: "demo-partner",
    company: "Demo Partner Network",
    industry: "Channel & alliances",
    headline: "Partner shares outperformed brand-owned posts by 8×",
    summary:
      "Demo narrative for a partner ecosystem campaign where approved post variants kept every share on-brand while attribution stayed intact.",
    metrics: [
      { label: "Partner advocates", value: "340" },
      { label: "Engagement lift", value: "+182%" },
      { label: "Opportunities", value: "96" },
    ],
    tags: ["Partners", "Attribution"],
  },
];
