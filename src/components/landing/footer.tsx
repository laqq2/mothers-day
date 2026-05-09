export function Footer() {
  return (
    <footer className="border-t border-[#E8D5C0] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/forevergram-logo.png" alt="Forevergram logo" className="h-8 w-8 rounded-md object-cover" />
            <p className="font-['Playfair_Display'] text-lg text-[#1C1008]">Forevergram</p>
          </div>
          <p className="font-['DM_Sans'] text-xs text-[#1C1008]/40">Made with love for every mum.</p>
        </div>
        <p className="mt-3 font-['DM_Sans'] text-xs text-[#1C1008]/35">© 2026 Forevergram. All rights reserved.</p>
      </div>
    </footer>
  );
}
