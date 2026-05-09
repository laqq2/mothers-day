import { get } from "@vercel/blob";

function badRequest(message: string) {
  return new Response(message, { status: 400 });
}

export async function GET(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new Response("Blob token is not configured", { status: 500 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) {
    return badRequest("Missing path");
  }

  try {
    const result = await get(path, {
      access: "private",
      token,
      useCache: true,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": result.blob.cacheControl || "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Could not load image", { status: 502 });
  }
}
