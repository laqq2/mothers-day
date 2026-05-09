import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

const ALLOWED_PATHNAME = /^forevergram\/[A-Za-z0-9_-]{6,16}\/(?:hero|card-\d{1,3})\.(?:jpg|jpeg|png|webp|gif)$/;

const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response("Blob token is not configured", { status: 500 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!ALLOWED_PATHNAME.test(pathname) || pathname.includes("..")) {
          throw new Error("Invalid upload path");
        }
        return {
          access: "private",
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          // ~7 day cache hint; immutable handled by our /api/blob-image proxy too.
          cacheControlMaxAge: 60 * 60 * 24 * 7,
        };
      },
      onUploadCompleted: async () => {
        // No-op: we record the pathname when the publish server action runs.
      },
    });

    return Response.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload init failed";
    return new Response(message, { status: 400 });
  }
}
