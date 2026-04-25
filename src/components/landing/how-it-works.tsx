const STEPS = [
  {
    number: "01",
    title: "Add your memories",
    description:
      "Upload your favourite photos and write a line or two for each one. Add as many or as few as you like.",
  },
  {
    number: "02",
    title: "Choose your style",
    description:
      "Pick a colour theme and a closing effect that feels right. Warm, moody, golden — it's all there.",
  },
  {
    number: "03",
    title: "Share the link",
    description:
      "Hit publish and get a link. Send it on WhatsApp, save it as a screenshot, or just keep it for yourself.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="mb-16 text-center font-['Playfair_Display'] text-4xl text-[#1C1008]">Three steps. One link. Forever.</h2>
      <div className="grid gap-12 md:grid-cols-3">
        {STEPS.map((step, idx) => (
          <article
            key={step.number}
            className="transition duration-500"
            style={{ animation: `fadeInUp 0.7s ease-out ${idx * 0.12}s both` }}
          >
            <p className="font-['Playfair_Display'] text-7xl text-[#C4714A]/20">{step.number}</p>
            <h3 className="mt-2 font-['Playfair_Display'] text-xl text-[#1C1008]">{step.title}</h3>
            <p className="mt-2 font-['Lora'] text-base leading-relaxed text-[#1C1008]/65">{step.description}</p>
          </article>
        ))}
      </div>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
