import Link from "next/link";

import { getAdminStats, getRecentTimelinesForAdmin } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminPageProps = {
  searchParams: { key?: string };
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const expected = process.env.ADMIN_KEY;
  const provided = searchParams.key ?? "";

  if (!expected) {
    return (
      <main className="min-h-screen bg-[#FBF6EF] px-6 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E8D5C0] bg-white/80 p-6 text-center shadow-sm">
          <p className="font-['Playfair_Display'] text-2xl text-[#1C1008]">Admin not configured</p>
          <p className="mt-2 font-['DM_Sans'] text-sm text-[#1C1008]/70">
            Set <code className="rounded bg-[#FBF6EF] px-1 py-0.5">ADMIN_KEY</code> in your environment, then visit{" "}
            <code className="rounded bg-[#FBF6EF] px-1 py-0.5">/admin?key=...</code>.
          </p>
        </div>
      </main>
    );
  }

  if (provided !== expected) {
    return (
      <main className="min-h-screen bg-[#FBF6EF] px-6 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E8D5C0] bg-white/80 p-6 text-center shadow-sm">
          <p className="font-['Playfair_Display'] text-2xl text-[#1C1008]">Unauthorized</p>
          <p className="mt-2 font-['DM_Sans'] text-sm text-[#1C1008]/70">
            Append <code className="rounded bg-[#FBF6EF] px-1 py-0.5">?key=YOUR_ADMIN_KEY</code> to this URL.
          </p>
        </div>
      </main>
    );
  }

  const [stats, rows] = await Promise.all([
    getAdminStats(),
    getRecentTimelinesForAdmin(100),
  ]);

  return (
    <main className="min-h-screen bg-[#FBF6EF] px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-['DM_Sans'] text-[11px] uppercase tracking-[0.2em] text-[#C4714A]">
              Forevergram · admin
            </p>
            <h1 className="mt-1 font-['Playfair_Display'] text-3xl text-[#1C1008] sm:text-4xl">
              Signups & timelines
            </h1>
          </div>
          <Link
            href="/"
            className="font-['DM_Sans'] text-xs uppercase tracking-[0.18em] text-[#1C1008]/60 hover:text-[#1C1008]"
          >
            ← Back to site
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Timelines created" value={stats?.totalTimelines ?? 0} />
          <StatCard label="Email signups" value={stats?.totalEmails ?? 0} />
          <StatCard label="Last 24h" value={stats?.last24h ?? 0} />
          <StatCard label="Last 7 days" value={stats?.last7d ?? 0} />
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#E8D5C0] bg-white/90 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#FBF6EF] font-['DM_Sans'] text-[10px] uppercase tracking-[0.16em] text-[#1C1008]/60">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Dedicated to</th>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="font-['DM_Sans'] text-sm text-[#1C1008]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#1C1008]/50">
                    No timelines yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.slug} className="border-t border-[#E8D5C0]/60">
                    <td className="whitespace-nowrap px-4 py-3 text-[#1C1008]/70">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">{row.dedicated_to}</td>
                    <td className="px-4 py-3 text-[#1C1008]/70">{row.creator_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.creator_email ? (
                        <a className="text-[#C4714A] hover:underline" href={`mailto:${row.creator_email}`}>
                          {row.creator_email}
                        </a>
                      ) : (
                        <span className="text-[#1C1008]/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[#1C1008]/70">{row.view_count}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/t/${row.slug}`}
                        className="font-semibold text-[#C4714A] hover:underline"
                      >
                        /t/{row.slug}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-['DM_Sans'] text-xs text-[#1C1008]/45">
          Showing latest {rows.length} timeline{rows.length === 1 ? "" : "s"}.
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E8D5C0] bg-white/90 p-5 shadow-sm">
      <p className="font-['DM_Sans'] text-[10px] uppercase tracking-[0.2em] text-[#1C1008]/55">{label}</p>
      <p className="mt-2 font-['Playfair_Display'] text-4xl text-[#1C1008]">{value.toLocaleString()}</p>
    </div>
  );
}
