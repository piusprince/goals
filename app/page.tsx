import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { DemoSection } from "@/components/landing/demo-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <DemoSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}