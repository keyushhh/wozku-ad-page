import { CaseStudies } from "./components/sections/CaseStudies";
import { Footer } from "./components/sections/Footer";
import { Hero } from "./components/sections/Hero";
import { Navigation } from "./components/sections/Navigation";
import { ROICalculator } from "./components/sections/ROICalculator";
import { Sponsors } from "./components/sections/Sponsors";
import { Testimonials } from "./components/sections/Testimonials";

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Sponsors />
        <CaseStudies />
        <ROICalculator />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
