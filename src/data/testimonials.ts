export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
  metric: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We replaced a week of paid promotion with one advocate campaign. The demo dashboard made it obvious which teams were actually moving pipeline.",
    author: "Alex Chen",
    title: "VP Marketing",
    company: "Demo SaaS Co.",
    metric: "Demo: 4.1× reach vs. paid baseline",
  },
  {
    id: "t2",
    quote:
      "Our field team finally had approved stories they could share in minutes. Attribution turned anecdotal wins into numbers leadership could trust.",
    author: "Priya Nair",
    title: "Head of Partner Marketing",
    company: "Demo Alliance Group",
    metric: "Demo: 62% faster campaign setup",
  },
  {
    id: "t3",
    quote:
      "The ROI model helped us justify budget before we scaled. Even conservative assumptions showed advocacy paying back faster than our event sponsorship mix.",
    author: "Marcus Webb",
    title: "Director, Demand Gen",
    company: "Demo Enterprise",
    metric: "Demo: 218% modeled ROI",
  },
];
