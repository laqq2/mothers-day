# Forevergram — Launch Playbook

**Today:** May 9 · **AU Mother's Day:** May 11 · **PH Launch Day:** May 13 (Tuesday)

---

## Timeline

| Date | Action |
|---|---|
| May 9 (today) | Finish builder + deploy to Vercel |
| May 10 | Create your own Mum's Forevergram, post it to family WhatsApp, record a screen demo video |
| May 11 (Mother's Day) | Soft launch — share your Mum's link personally, post on LinkedIn + Instagram, text friends |
| May 12 | Submit to Product Hunt (goes live May 13 12:01am PST) |
| May 13 | PH launch day — execute the hustle checklist |

---

## Product Hunt Listing

**Name:** Forevergram

**Tagline:**
> Make Mum cry (in a good way)

**Alternative taglines (pick one):**
- "Your photos. Her story. One link she'll watch forever."
- "A cinematic memory reel for Mum — built in 5 minutes, free"
- "Give Mum a tribute worth saving forever"

**Description (paste into PH):**
```
I built Forevergram for my Mum this Mother's Day — and I wanted it to feel like nothing else out there.

Most people send a text or buy a generic card. Forevergram lets you turn your photos into a full-screen cinematic reel — like TikTok, but for your memories. Each year snaps into view. Her name on the screen. A closing message that fades in word by word.

You share a link. She opens it on her phone. It works in any browser, no app needed.

**How it works:**
1. Upload your favourite photos — one per memory
2. Add a year and a caption for each
3. Choose a vibe (Warm / Midnight / Garden / Golden Hour)
4. Hit publish → get your link in seconds

Completely free. No account needed. Takes 5 minutes.

Built with Next.js, Framer Motion, and Supabase. The snap-scroll experience is inspired by Reels but designed to feel emotional, not addictive.

Would love your feedback — this is v1 and I'm shipping fast. 🌸
```

**Topics to select on PH:**
- Gifts
- Photo & Video
- Design Tools
- Productivity
- Mother's Day

**Gallery images needed (make these before submitting):**
1. Hero image (1270×760): phone mockup showing the snap-scroll reel with a warm memory
2. Screenshot 2: the builder UI — clean multi-step form
3. Screenshot 3: finale screen with the word-by-word animation
4. Screenshot 4: 4 theme options side by side
5. GIF/Video: 15–30s screen recording of the full viewer experience — hero → swipe → memory cards → finale

**First comment (post immediately after launch goes live at 12:01am PST):**
```
Hey PH! Evan here — I'm the maker.

Quick story: I built the first version of this in 48 hours because I wanted to do something actually meaningful for my Mum this Mother's Day. A card felt too generic. A photo book took forever. So I built this.

I'd love to know:
- Did you try making one? How did it feel?
- What would make it better?
- Would you pay for extras (custom domain, video export, more cards)?

The "Create your own →" button at the end of every timeline is how this thing spreads — so if you make one today, your Mum becomes part of the launch 🌸

Happy to answer anything.
```

---

## LinkedIn Post (post May 11 — Mother's Day morning)

```
I built something for my Mum this Mother's Day.

Not a card. Not flowers. A link.

It opens on her phone and plays like a reel — each photo snapping into view, the year big on screen, a caption she's never seen before. At the end, a message I wrote just for her fades in word by word.

I built it in 48 hours. It's called Forevergram.

And I made it free, because I wanted anyone to be able to do this for their mum today.

→ forevergram.co

If you've got 5 minutes before you call her, make one.

(Also shipping on Product Hunt Tuesday — would mean a lot if you followed along)

#MothersDay #buildinpublic #indiehacker #webdev
```

---

## Twitter/X Thread (post May 13 — PH launch day)

**Tweet 1:**
```
I built Forevergram for my Mum this Mother's Day.

It's like TikTok, but for memories. Each year snaps full-screen. Her name on the opening slide. A closing message that fades in word by word.

Free. No account. Takes 5 minutes.

Launching on @ProductHunt today 🌸

[link to PH listing]
```

**Tweet 2:**
```
The idea: most people send a text or a generic card.

But what if you could give her something cinematic? Something she'd open on her phone and actually feel?

That's Forevergram.
```

**Tweet 3:**
```
Tech stack if you're curious:
→ Next.js 14 (App Router)
→ Framer Motion for the snap-scroll + animations
→ Supabase for storage + DB
→ Tailwind CSS
→ Deployed on Vercel

Built in ~48 hours solo.
```

**Tweet 4:**
```
What I'm most proud of: the viewer feels like nothing else.

Full-screen. Snaps like Reels. Photo fills the whole screen. Year in huge Playfair Display. Caption fades up from the bottom.

At the end, petals fall while her final message appears word by word.

It made me tear up building it.
```

**Tweet 5:**
```
If you make one today, reply with your link. I want to see them.

And if you're on PH — an upvote would mean everything.

→ [PH link]
```

---

## Reddit Posts

### r/webdev
**Title:** I built a TikTok-style memory reel app for Mother's Day in 48 hours — here's what I learned

```
Built this over the past 48 hours for Mother's Day. It's called Forevergram — you upload photos, write a caption per memory, and it generates a full-screen snap-scroll reel (think Instagram Reels but for family memories).

**Tech:**
- Next.js 14 App Router
- Framer Motion (scroll snap + whileInView animations)
- Supabase (Postgres + Storage)
- Tailwind CSS
- Vercel

**Interesting challenges:**
- CSS scroll-snap with `scroll-snap-type: y mandatory` on mobile Safari requires the property on the scroll container, not html/body — lost an hour on this
- Getting `IntersectionObserver` + `prefers-reduced-motion` to coexist cleanly
- Image compression client-side before upload without a library

Demo: forevergram.co/t/demo-timeline
Make one: forevergram.co/create

Happy to answer any technical questions.
```

### r/InternetIsBeautiful
**Title:** I made a free app that turns your photos into a cinematic memory reel for Mum — like TikTok but for memories

```
forevergram.co

Upload photos, add a year and caption for each memory, choose a vibe, get a link. She opens it on her phone and it snaps through each year like a reel.

Free, no account needed, takes 5 minutes. Made it for Mother's Day.

Demo if you want to see it first: forevergram.co/t/demo-timeline
```

### r/AusFinance / r/australia
**Title:** Made a free Mother's Day gift for those of us who forgot / ran out of ideas

```
It's called Forevergram. You upload a few photos, write a line for each memory, and it creates a cinematic link she can open on her phone. Looks like an Instagram reel but for your family memories.

Free. No account. Takes 5 minutes. 

forevergram.co

Mother's Day is tomorrow. You're welcome.
```

---

## WhatsApp / iMessage to friends (send personally, not a blast)

```
Hey — I built something this week for Mother's Day and it's actually kinda beautiful. It's called Forevergram — you upload photos and it makes a cinematic reel you share as a link. Free, takes 5 mins.

Made one for my Mum: [your mum's link]

Make one for yours: forevergram.co/create
```

Send this to 20+ friends personally. One-to-one, not a group blast. Personal messages convert way better.

---

## Facebook Groups to post in (May 11)

- "Gifts for Mum" type groups
- Local suburb/city community groups (Nextdoor, local Facebook groups)
- Parent + family groups
- r/ADHD, r/Mommit (framing: "last minute Mother's Day idea")

---

## PH Launch Day Hustle Checklist (May 13)

Morning (12:01am PST / ~6pm AEDT):
- [ ] Confirm listing is live
- [ ] Post your first comment immediately
- [ ] Tweet thread
- [ ] Post on LinkedIn
- [ ] Text 10–20 friends the PH link directly

During the day:
- [ ] Reply to every PH comment within 30 minutes
- [ ] Post in relevant Slack communities (Indie Hackers, Maker groups)
- [ ] Post in r/webdev, r/InternetIsBeautiful, r/SideProject
- [ ] DM any indie hackers / PH hunters you know

End of day:
- [ ] Thank-you tweet regardless of result
- [ ] Screenshot the final position + upvote count
- [ ] Post a "what I learned" thread — these go viral on their own

---

## Vercel / Launch Checklist (do before May 11)

- [ ] Deploy to Vercel, point to forevergram.co domain
- [ ] Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env vars
- [ ] Run Supabase migration (timelines + memory_cards tables)
- [ ] Set Supabase Storage bucket `timeline-images` to public
- [ ] Add Storage budget alert at $20 in Supabase dashboard
- [ ] Test full flow end-to-end: create → publish → view link
- [ ] Test on iPhone Safari specifically (scroll snap gotcha)
- [ ] Create your Mum's actual Forevergram — this is your demo + emotional proof
- [ ] Record a 30s screen recording of the viewer for PH gallery
- [ ] Design OG image (1200×630) — warm cream bg, Forevergram wordmark, phone mockup

---

## Domain

**forevergram.co** — check availability at Namecheap or Porkbun.
Fallback options: forevergram.app / forevergram.me / makeaforevergram.com

Buy today before you ship.
