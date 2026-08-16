import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProgramsGrid } from "@/components/ProgramsGrid";
import { StatsSection } from "@/components/StatsSection";
import { ProgramDetails } from "@/components/ProgramDetails";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-jarvis-navy">
      <Navbar />
      <Hero />
      <ProgramsGrid />
      <StatsSection />
      <ProgramDetails />
      <UrgencyBanner />
      <Testimonials />
      <FAQ />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
