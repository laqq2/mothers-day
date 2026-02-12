# 📜 Letter Through Time — Product Requirements Document
**Version:** 1.0  
**Author:** Laqq  
**Date:** May 2026  
**Status:** Ready for Development

---

## 1. Overview

### 1.1 Product Summary
**Letter Through Time** is a web app that lets anyone create a cinematic, scrollable memory timeline as a personalised tribute to their mother (or any loved one). Users build their timeline by adding memory cards — each with a photo, year, and caption — and the result is a beautiful, shareable link that feels like a short film about their relationship.

Timed for Mother's Day, but designed to be evergreen.

### 1.2 One-Liner
> *"Turn your memories into a cinematic tribute — shareable in 5 minutes."*

### 1.3 Problem
Most people want to do something deeply personal for their mum but resort to a text message or a generic card. The alternatives (photo books, slideshows, custom websites) take hours and require design skills. There's no fast, beautiful, emotionally resonant middle ground.

### 1.4 Solution
A zero-friction builder that outputs a cinematic scroll experience. No design skills required. Just upload photos, write a line or two, and share a link. The product does the heavy lifting aesthetically.

### 1.5 Target Audience
- Primary: 16–35 year olds wanting to do something more meaningful than a text
- Secondary: Anyone wanting to create a tribute for a parent, grandparent, or loved one
- Launch context: Mother's Day (May 2026 AU, May 2026 US)

---

## 2. User Flow

### 2.1 High-Level Flow
```
Landing Page → Click "Create Your Timeline" 
→ Builder (Step-by-step)
  → Add name + relationship
  → Add memory cards (photo + year + caption)
  → Write final message
  → Preview
→ Generate shareable link (saved to DB)
→ Share / View live timeline
```

### 2.2 Detailed Steps

**Step 1 — Dedication**
- Input: "This timeline is for..." (e.g. "Mum", "Mam", "Mom", "Grandma")
- Input: The person's name (e.g. "Linda")
- Optional: Upload a hero photo (used as the opening full-screen image)

**Step 2 — Add Memories (repeatable)**
- Upload photo (required)
- Year (required — used for timeline ordering and display)
- Caption / memory text (required, max 280 chars)
- Emotion tag (optional): Love / Funny / Proud / Grateful / Nostalgic
- Users can add between 1 and 20 memory cards
- Cards can be reordered via drag-and-drop

**Step 3 — Final Message**
- Text area: "A message to close with..." (max 500 chars)
- This becomes the final "bloom" screen at the end of the timeline

**Step 4 — Customise (optional)**
- Choose colour theme: Warm (default) / Midnight / Garden / Golden Hour
- Choose ending effect: Petals / Confetti / Stars / Sparkles

**Step 5 — Preview & Publish**
- Full-screen preview of the timeline
- Click "Publish & Get My Link"
- Link generated: `letterthroughtime.com/t/[unique-slug]`
- Options: Copy link, Share to WhatsApp, Share to Instagram Stories, Download as video (stretch goal)

---

## 3. Core Features (MVP)

### 3.1 The Builder
- Multi-step form UI (not a single long form — feels like a guided experience)
- Progress indicator showing steps
- Live mini-preview in the sidebar as user builds
- Autosave to localStorage (so refreshing doesn't lose progress)
- Image upload with client-side compression (max 5MB input → compressed for storage)

### 3.2 The Timeline (Viewer)
The shareable output. This is the product's heart.

**Opening sequence:**
- Full-screen hero image (or animated gradient if no hero photo uploaded)
- Name fades in: *"A Letter Through Time — for Linda"*
- Subtitle: *"Made with love by [creator's name, optional]"*
- Subtle prompt: "Scroll to begin ↓" with animated arrow

**Memory cards (scroll-triggered):**
- Each card enters with a cinematic animation as you scroll into view
  - Odd cards: slide in from left
  - Even cards: slide in from right
  - On mobile: all fade up from below
- Card layout:
  - Photo (takes up ~60% of card width on desktop, full width on mobile)
  - Year displayed as large typographic element (e.g. "1998")
  - Caption text beneath
  - Optional emotion tag as a small pill badge
- Gentle parallax on photos as you scroll past them
- Timeline spine: a vertical line connecting all cards with animated progress dot

**Inter-card transitions:**
- Subtle full-screen colour wash between cards (tinted to the chosen theme)
- Optional: ambient audio waveform visual (no actual audio — purely visual rhythm)

**Final message screen:**
- Full-screen, centred
- The final message text fades in word-by-word
- Chosen ending effect plays (petals / confetti / stars / sparkles)
- "Share this timeline" CTA button appears after effect completes
- Prompt: *"Create your own →"* (referral loop back to builder)

### 3.3 Sharing & Persistence
- Each published timeline gets a unique slug (nanoid, 8 chars)
- Timeline data stored in Supabase (see Tech Stack)
- Images stored in Supabase Storage
- Links are permanent and publicly accessible (no auth required to view)
- Timeline creator can optionally set a password to protect viewing

### 3.4 Landing Page
Separate from the builder — a dedicated marketing page that:
- Hero: Shows the product in action (autoplay demo timeline or animated mockup)
- Headline: "Give her a tribute worth saving forever."
- Social proof: "X timelines created this Mother's Day"
- 3 steps: Add memories → Customise → Share
- CTA: "Create yours — it's free"
- FAQ section
- Footer with about/contact

---

## 4. Stretch Features (Post-MVP)

| Feature | Notes |
|---|---|
| AI memory helper | "Stuck on what to write?" → AI suggests captions based on year + emotion tag |
| Video export | Export the timeline as an MP4 to share on Instagram Reels / TikTok |
| Music layer | Attach a Spotify preview or choose from royalty-free ambient tracks |
| Collaborative mode | Multiple family members can add memory cards to the same timeline |
| Print mode | Generate a print-quality PDF / photo book layout |
| Anniversary / Birthday mode | Reframe for other occasions beyond Mother's Day |
| Reactions | Viewers can leave emoji reactions that the creator sees |
| Password protection | Creator sets a password, only family can view |
| Edit after publish | Revisit and update your timeline |
| Analytics | Creator sees how many times their link was opened |

---

## 5. Tech Stack

### 5.1 Recommended Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for timeline pages = fast share link loads, good for SEO |
| Styling | Tailwind CSS | Fast utility-first, good for responsive timeline layout |
| Animations | Framer Motion | Scroll-triggered animations, spring physics, gesture support |
| Database | Supabase (Postgres) | You already know it from LockonAI / Focal |
| File Storage | Supabase Storage | Keeps infra simple, S3-compatible |
| Auth | None (MVP) | No login required — reduces friction. Add later if needed |
| Deployment | Vercel | You already use this, zero-config Next.js |
| Slug generation | nanoid | Short unique IDs for share links |
| Image handling | browser-image-compression (npm) | Client-side compression before upload |
| Confetti/particles | canvas-confetti | Lightweight, well-maintained |

### 5.2 Database Schema

```sql
-- timelines table
create table timelines (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,           -- e.g. "ab3kx9mq"
  dedicated_to text not null,           -- "Mum", "Mam", "Linda"
  creator_name text,                    -- optional
  hero_image_url text,                  -- optional opening image
  final_message text not null,
  theme text default 'warm',            -- warm | midnight | garden | golden
  ending_effect text default 'petals',  -- petals | confetti | stars | sparkles
  password_hash text,                   -- optional protection
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- memory_cards table
create table memory_cards (
  id uuid default gen_random_uuid() primary key,
  timeline_id uuid references timelines(id) on delete cascade,
  position integer not null,            -- ordering (0-indexed)
  year integer not null,
  caption text not null,
  emotion_tag text,                     -- love | funny | proud | grateful | nostalgic
  image_url text not null,
  created_at timestamptz default now()
);

-- indexes
create index on timelines(slug);
create index on memory_cards(timeline_id, position);
```

### 5.3 File Storage Structure
```
supabase-storage/
  timeline-images/
    {timeline_slug}/
      hero.jpg
      card-0.jpg
      card-1.jpg
      ...
```

---

## 6. Routes & Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing + CTA |
| `/create` | Builder | Multi-step timeline creator |
| `/preview` | Preview | Full timeline preview before publishing |
| `/t/[slug]` | Timeline Viewer | The shareable output — publicly accessible |
| `/t/[slug]/edit` | Editor | Return to edit (stretch, requires creator token) |

---

## 7. Visual Design Direction

### 7.1 Aesthetic
**Vibe name:** *Warm Archive*

Think: a well-loved family photo album, shot on film, left in warm afternoon light. Not sentimental in a Hallmark way — genuine, textured, human.

- **Not** clinical, tech-forward, or startup-generic
- **Not** overly feminine/pastel (it should feel usable for anyone)
- **Yes** to warmth, grain textures, film-like tones, editorial typography

### 7.2 Themes

**Warm (default)**
- Background: `#FBF6EF` (warm cream)
- Accent: `#C4714A` (terracotta)
- Text: `#1C1008` (deep warm brown)
- Timeline spine: `#E8D5C0`

**Midnight**
- Background: `#0F0F18`
- Accent: `#9B7FEA` (soft violet)
- Text: `#F0EEF8`
- Timeline spine: `#2A2A40`

**Garden**
- Background: `#F1F7F1`
- Accent: `#4A7C59` (sage green)
- Text: `#1A2B1E`
- Timeline spine: `#C8DEC8`

**Golden Hour**
- Background: `#1A1008`
- Accent: `#E8B84B` (gold)
- Text: `#FAF0DC`
- Timeline spine: `#3A2A10`

### 7.3 Typography
- **Display / Years:** Playfair Display (Google Fonts) — editorial, timeless
- **Body / Captions:** Lora (Google Fonts) — readable serif, warm
- **UI elements / Labels:** DM Sans — clean, neutral, doesn't fight the display fonts

### 7.4 Animation Principles
- All timeline card animations are scroll-triggered (IntersectionObserver or Framer Motion `whileInView`)
- Duration: 0.6s–0.9s per card reveal
- Easing: `easeOut` — quick in, slow settle
- Never animate more than 2 elements simultaneously per card
- Mobile: simpler animations (fade up only, no slide-from-sides — performance)
- Reduce motion: respect `prefers-reduced-motion` media query

---

## 8. Monetisation Strategy

### 8.1 MVP (Free)
Launch fully free to maximise viral spread for Mother's Day. Every shared link contains *"Create your own →"* which drives organic referrals.

### 8.2 Post-MVP Paid Tier (~$9 one-time or $4.99/month)
| Feature | Free | Pro |
|---|---|---|
| Memory cards | Up to 8 | Unlimited |
| Themes | 2 (Warm + Midnight) | All 4 |
| Ending effects | 1 (Petals) | All 4 |
| Branding on viewer | "Made with Letter Through Time" watermark | Removed |
| Video export | ✗ | ✓ |
| AI caption helper | ✗ | ✓ |
| Edit after publish | ✗ | ✓ |
| Custom domain | ✗ | ✓ (stretch) |

### 8.3 AppSumo Launch Strategy
- Offer LTD (Lifetime Deal) for ~$19–$29 for Pro
- Position as: "The tool you buy once, use every Mother's Day, every birthday, every anniversary"
- Projected AppSumo target: 500 LTD buyers = ~$10k launch

---

## 9. Launch Plan

### Phase 1 — Build (Now → May 9)
- [ ] Set up Next.js + Supabase project
- [ ] Build multi-step builder UI
- [ ] Build timeline viewer with scroll animations
- [ ] Image upload + storage pipeline
- [ ] Slug generation + shareable link
- [ ] Landing page
- [ ] Deploy to Vercel

### Phase 2 — Soft Launch (May 10–11)
- [ ] Personal use: create one for your own mum, share it
- [ ] Post the story on LinkedIn ("I built this in 48 hours for my mum...")
- [ ] Share in relevant Facebook groups / Reddit (r/webdev, r/malelifestyle, r/AusFinance)
- [ ] Submit to Product Hunt for Mother's Day weekend

### Phase 3 — Product Hunt (May 11 — AU Mother's Day)
- [ ] PH listing with demo GIF / video
- [ ] Tagline: *"Create a cinematic memory timeline for Mum — shareable in 5 minutes"*
- [ ] Hunter: reach out to a known PH hunter in advance

### Phase 4 — Post-Launch (May 12+)
- [ ] Collect feedback from early users
- [ ] Add Pro tier + Stripe
- [ ] Prep AppSumo application
- [ ] Reframe for Father's Day / birthdays / anniversaries

---

## 10. Out of Scope (MVP)

- User accounts / login
- Editing timelines after publish
- Collaborative editing
- Video/audio media (images only for MVP)
- Native mobile app
- Custom domains
- Analytics dashboard for creators

---

## 11. Success Metrics

| Metric | Target (Week 1) |
|---|---|
| Timelines published | 200+ |
| Unique visitors | 2,000+ |
| Share link click-through rate | >40% |
| PH upvotes | 100+ |
| "Create your own" conversions from viewer | >15% |

---

## 12. Open Questions

1. **Domain:** Is `letterthroughtime.com` available? Alternatives: `timelinefor.mom`, `deartimeline.com`, `memoryfilm.co`
2. **Image moderation:** Should we add basic NSFW filtering on uploads before storing? (Recommend yes, use a free tier API like SightEngine or Anthropic vision check)
3. **GDPR / Privacy:** Since we're storing user-uploaded photos publicly, need a clear privacy policy. Photos should be deletable on request.
4. **AU Mother's Day vs US:** AU Mother's Day is May 11 2025 — already passed. US Mother's Day is the second Sunday of May each year. Check current year timing and adjust launch accordingly.
5. **Creator token:** Without auth, how does the creator return to edit? Options: (a) email a magic edit link on publish, (b) store creator token in localStorage, (c) don't support editing MVP.

---

*End of PRD — Letter Through Time v1.0*