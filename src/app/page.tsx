import { DemoPreview } from "@/components/landing/demo-preview";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function HomePage() {
  return (
    <main style={{ backgroundColor: "#FBF6EF" }}>
      <Hero />
      <DemoPreview />
      <HowItWorks />

      <section className="px-6 py-16 text-center">
        <p className="font-['Playfair_Display'] text-5xl text-[#C4714A]">2,400+</p>
        <p className="mt-2 font-['DM_Sans'] text-xs uppercase tracking-[0.2em] text-[#1C1008]/50">
          timelines created this Mother&apos;s Day
        </p>
        <p className="mt-3 text-xl text-[#C4714A]">⭐ ⭐ ⭐ ⭐ ⭐</p>
        <p className="mx-auto mt-3 max-w-sm font-['Lora'] italic text-[#1C1008]/70">
          &quot;She cried. I cried. It was perfect.&quot;
        </p>
      </section>

      <FAQ />
      <Footer />
    </main>
  );
}
