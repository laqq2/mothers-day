const DEMO_ITEMS = [
  {
    year: "2003",
    caption: "Saturday mornings meant pancakes, cartoons, and your laugh filling the kitchen.",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
  },
  {
    year: "2011",
    caption: "At every school concert, I could always find you in the crowd before the first note.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
  },
  {
    year: "2018",
    caption: "When life got heavy, you reminded me I could always begin again.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
];

export function DemoPreview() {
  return (
    <section className="overflow-hidden bg-[#1C1008] px-6 py-24">
      <h2 className="mb-14 text-center font-['Playfair_Display'] text-4xl text-white">One scroll. A lifetime of love.</h2>

      <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {DEMO_ITEMS.map((item, idx) => (
          <article
            key={item.year}
            className="relative h-[380px] w-[220px] shrink-0 overflow-hidden rounded-[2.5rem] border-[6px] border-white/10"
            style={{ animation: `fadeInUp 0.65s ease-out ${idx * 0.12}s both` }}
          >
            <img src={item.image} alt={item.caption} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="font-['Playfair_Display'] text-5xl text-[#C4714A]">{item.year}</p>
              <p className="mt-2 font-['Lora'] text-xs leading-relaxed text-white/80">{item.caption}</p>
            </div>
          </article>
        ))}
      </div>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
