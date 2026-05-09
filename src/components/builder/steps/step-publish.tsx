"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { publishTimelineAction } from "@/app/actions/publish-timeline";
import { subscribeEmailAction } from "@/app/actions/subscribe-email";
import type { DraftTimeline } from "@/components/builder/builder";
import { buildPublishFormData } from "@/lib/publish-form";

type StepPublishProps = {
  draft: DraftTimeline;
  onBack: () => void;
  onPublished: (slug: string) => void;
};

export function StepPublish({ draft, onBack, onPublished }: StepPublishProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailState, setEmailState] = useState<
    | { kind: "idle" }
    | { kind: "ok"; emailed: boolean; address: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validCards = draft.cards.filter((card) => card.file && card.year.trim() && card.caption.trim());

  const shareUrl = useMemo(() => {
    if (!publishedSlug) return "";
    if (typeof window === "undefined") return `/t/${publishedSlug}`;
    return `${window.location.origin}/t/${publishedSlug}`;
  }, [publishedSlug]);

  const shareText = useMemo(
    () => `I made this for ${draft.dedicated_to || "Mum"} on Forevergram — watch it here:`,
    [draft.dedicated_to],
  );

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const flashShareStatus = (message: string) => {
    setShareStatus(message);
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareStatus(null), 2600);
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `A timeline for ${draft.dedicated_to || "Mum"}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      if (aborted) return;
    }
    await handleCopyLink();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      flashShareStatus("Link copied — paste it anywhere.");
    } catch {
      flashShareStatus("Couldn't copy automatically. Long-press the link to copy.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleSmsShare = () => {
    if (!shareUrl) return;
    const body = encodeURIComponent(`${shareText} ${shareUrl}`);
    if (typeof window !== "undefined") {
      window.location.href = `sms:?&body=${body}`;
    }
  };

  if (publishedSlug) {
    return (
      <section>
        <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#C4714A]">All done</p>
        <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">
          Your timeline is live for {draft.dedicated_to || "Mum"}
        </h2>
        <p className="mt-2 text-sm text-[#1C1008]/70">
          Send the link below — anyone who opens it can watch the whole reel. No login, no app.
        </p>

        <div className="mt-6 rounded-2xl border border-[#E8D5C0] bg-white p-4 shadow-[0_8px_24px_rgba(121,78,45,0.08)]">
          <p className="font-['DM_Sans'] text-[11px] uppercase tracking-[0.18em] text-[#1C1008]/50">
            Your shareable link
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full truncate rounded-lg border border-[#E8D5C0] bg-[#FBF6EF] px-3 py-2 font-['DM_Sans'] text-sm text-[#1C1008]"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 font-['DM_Sans'] text-xs font-semibold text-[#1C1008] transition hover:bg-[#FBF6EF]"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E8D5C0] bg-[#FBF6EF]/70 p-5 shadow-[0_8px_24px_rgba(121,78,45,0.06)]">
          {emailState.kind === "ok" ? (
            <div>
              <p className="font-['Playfair_Display'] text-lg text-[#1C1008]">
                {emailState.emailed ? "Sent — check your inbox." : "Saved. We'll be in touch."}
              </p>
              <p className="mt-1 font-['DM_Sans'] text-xs text-[#1C1008]/65">
                {emailState.emailed
                  ? `We just sent your link to ${emailState.address}. If it doesn't arrive in a few minutes, check spam.`
                  : `We've recorded ${emailState.address}. The link is right above — bookmark it so you never lose it.`}
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!publishedSlug || emailLoading) return;
                setEmailLoading(true);
                setEmailState({ kind: "idle" });
                try {
                  const result = await subscribeEmailAction(publishedSlug, email);
                  if (!result.ok) {
                    setEmailState({ kind: "error", message: result.error });
                    return;
                  }
                  setEmailState({ kind: "ok", emailed: result.emailed, address: email.trim() });
                } catch {
                  setEmailState({ kind: "error", message: "Couldn't save your email. Please try again." });
                } finally {
                  setEmailLoading(false);
                }
              }}
            >
              <p className="font-['Playfair_Display'] text-lg text-[#1C1008]">
                Email me a copy of the link
              </p>
              <p className="mt-1 font-['DM_Sans'] text-xs text-[#1C1008]/65">
                So you never lose it. We&apos;ll only use your email for this.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-[#E8D5C0] bg-white px-4 py-2.5 font-['DM_Sans'] text-sm text-[#1C1008] outline-none transition focus:border-[#C4714A] focus:ring-2 focus:ring-[#C4714A]/20"
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="shrink-0 rounded-full bg-[#1C1008] px-5 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {emailLoading ? "Sending..." : "Email me the link"}
                </button>
              </div>
              {emailState.kind === "error" ? (
                <p className="mt-2 font-['DM_Sans'] text-xs text-red-700">{emailState.message}</p>
              ) : null}
            </form>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="rounded-full bg-[#C4714A] px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white shadow-lg shadow-[#C4714A]/20 transition hover:scale-[1.02]"
          >
            {canNativeShare ? `Share with ${draft.dedicated_to || "Mum"}` : "Copy link to send"}
          </button>
          <Link
            href={`/t/${publishedSlug}`}
            className="rounded-full border border-[#1C1008]/20 bg-white px-6 py-3 text-center font-['DM_Sans'] text-sm font-semibold text-[#1C1008] transition hover:bg-[#FBF6EF]"
          >
            Watch the timeline →
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="rounded-full border border-[#1C1008]/15 bg-white px-4 py-2 font-['DM_Sans'] text-xs font-medium text-[#1C1008] transition hover:bg-[#FBF6EF]"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleSmsShare}
            className="rounded-full border border-[#1C1008]/15 bg-white px-4 py-2 font-['DM_Sans'] text-xs font-medium text-[#1C1008] transition hover:bg-[#FBF6EF]"
          >
            Text message
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(
              `A little something for ${draft.dedicated_to || "you"}`,
            )}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            className="rounded-full border border-[#1C1008]/15 bg-white px-4 py-2 font-['DM_Sans'] text-xs font-medium text-[#1C1008] transition hover:bg-[#FBF6EF]"
          >
            Email
          </a>
        </div>

        <p
          className="mt-3 h-4 font-['DM_Sans'] text-xs text-[#1C1008]/70"
          aria-live="polite"
        >
          {shareStatus ?? ""}
        </p>

        <p className="mt-6 font-['DM_Sans'] text-xs text-[#1C1008]/50">
          Tip — bookmark the link too. As long as you have it, you can come back any time.
        </p>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-2 font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/50">Step 5</p>
      <h2 className="font-['Playfair_Display'] text-3xl text-[#1C1008]">Publish and share</h2>
      <p className="mt-2 text-sm text-[#1C1008]/70">Everything looks good. Publish to generate your shareable link.</p>

      <div className="mt-6 rounded-2xl border border-[#E8D5C0] bg-white/70 p-4 text-[#1C1008] shadow-sm">
        <p><strong>For:</strong> {draft.dedicated_to || "—"}</p>
        <p><strong>Memories:</strong> {validCards.length}</p>
        <p><strong>Theme:</strong> {draft.theme}</p>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-[#E8D5C0] px-5 py-2 text-sm transition hover:bg-white">← Back</button>
        <button
          type="button"
          disabled={loading || !draft.dedicated_to.trim() || !draft.final_message.trim() || validCards.length === 0}
          onClick={async () => {
            try {
              setLoading(true);
              setError(null);
              const formData = await buildPublishFormData(draft);
              const result = await publishTimelineAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setPublishedSlug(result.slug);
              onPublished(result.slug);
            } catch {
              setError("Publishing failed. Please retry.");
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-full bg-[#C4714A] px-6 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? "Publishing..." : "Publish my timeline"}
        </button>
      </div>
    </section>
  );
}
