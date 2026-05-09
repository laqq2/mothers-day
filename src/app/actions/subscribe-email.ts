"use server";

import { neon } from "@neondatabase/serverless";

export type SubscribeResult =
  | { ok: true; emailed: boolean }
  | { ok: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(opts: { dedicatedTo: string; url: string }) {
  const safeName = escapeHtml(opts.dedicatedTo || "Mum");
  const safeUrl = escapeHtml(opts.url);
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FBF6EF;font-family:'DM Sans',Arial,sans-serif;color:#1C1008;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C4714A;margin:0 0 12px 0;">Forevergram</p>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:30px;line-height:1.25;margin:0 0 16px 0;color:#1C1008;">Your timeline for ${safeName} is live</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px 0;color:rgba(28,16,8,0.78);">
        Here's the link — share it with ${safeName} (or anyone you'd like to send it to). Anyone who opens it can watch the whole reel. No login, no app.
      </p>
      <div style="background:#fff;border:1px solid #E8D5C0;border-radius:14px;padding:16px;margin:0 0 24px 0;">
        <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(28,16,8,0.5);margin:0 0 6px 0;">Your link</p>
        <a href="${safeUrl}" style="font-size:15px;color:#C4714A;word-break:break-all;text-decoration:none;">${safeUrl}</a>
      </div>
      <p style="margin:0 0 12px 0;">
        <a href="${safeUrl}" style="display:inline-block;background:#C4714A;color:#fff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:999px;font-size:14px;">Open the timeline →</a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:rgba(28,16,8,0.55);margin:32px 0 0 0;">
        Save this email — as long as you have the link, you can always come back to your timeline.
      </p>
      <p style="font-size:12px;color:rgba(28,16,8,0.4);margin:24px 0 0 0;">— Forevergram</p>
    </div>
  </body>
</html>`;
}

function buildEmailText(opts: { dedicatedTo: string; url: string }) {
  const name = opts.dedicatedTo || "Mum";
  return [
    `Your Forevergram timeline for ${name} is live.`,
    "",
    `Open or share it: ${opts.url}`,
    "",
    "Anyone with the link can watch the whole reel — no login, no app.",
    "Save this email so you can always come back to your timeline.",
    "",
    "— Forevergram",
  ].join("\n");
}

export async function subscribeEmailAction(
  slug: string,
  email: string,
): Promise<SubscribeResult> {
  try {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      return { ok: false, error: "That doesn't look like a valid email address." };
    }
    if (!slug || typeof slug !== "string") {
      return { ok: false, error: "Missing timeline reference." };
    }

    const sql = getSql();

    const rows = await sql`
      update timelines
      set creator_email = ${trimmed}
      where slug = ${slug}
      returning slug, dedicated_to
    `;

    const row = rows[0] as { slug: string; dedicated_to: string } | undefined;
    if (!row) {
      return { ok: false, error: "We couldn't find that timeline. Refresh and try again." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No Resend key yet — we still recorded the signup; the user can send the link manually.
      return { ok: true, emailed: false };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://forevergram.vercel.app";
    const timelineUrl = `${siteUrl}/t/${row.slug}`;
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Forevergram <onboarding@resend.dev>";

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: fromAddress,
        to: trimmed,
        subject: `Your Forevergram link for ${row.dedicated_to || "Mum"}`,
        html: buildEmailHtml({ dedicatedTo: row.dedicated_to, url: timelineUrl }),
        text: buildEmailText({ dedicatedTo: row.dedicated_to, url: timelineUrl }),
      });
      return { ok: true, emailed: true };
    } catch {
      // Email send failed but we kept the signup. Don't fail loudly.
      return { ok: true, emailed: false };
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Couldn't save your email. Please try again.";
    return { ok: false, error: message };
  }
}
