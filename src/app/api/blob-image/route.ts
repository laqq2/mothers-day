import { get } from "@vercel/blob";

// Allow only safe blob pathnames (no traversal, no scheme, no spaces).
// Matches our publish layout: <prefix>/<slug>/<filename> e.g. forevergram/abc12345/card-0.jpg
const ALLOWED_PATH = /^[A-Za-z0-9][A-Za-z0-9_/.-]{2,127}$/;

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function bad(status: number, message: string) {
  return new Response(message, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return bad(500, "Blob token is not configured");
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) {
    return bad(400, "Missing path");
  }
  if (!ALLOWED_PATH.test(path) || path.includes("..")) {
    return bad(400, "Invalid path");
  }

  const ifNoneMatch = request.headers.get("if-none-match") ?? undefined;

  try {
    const result = await get(path, {
      access: "private",
      token,
      useCache: true,
      ifNoneMatch,
    });

    if (!result) {
      return bad(404, "Not found");
    }

    if (result.statusCode === 304) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": IMMUTABLE_CACHE,
        },
      });
    }

    if (!result.stream) {
      return bad(404, "Not found");
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": IMMUTABLE_CACHE,
        ETag: result.blob.etag,
      },
    });
  } catch {
    return bad(502, "Could not load image");
  }
}
