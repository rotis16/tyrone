import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  EXTRACTION_JSON_SCHEMA,
  EXTRACTION_SYSTEM_PROMPT,
  type ExtractionResponse,
} from "@/lib/extractionSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stateless extraction endpoint.
 *
 * The client never holds the API key — that's the reason this route exists at
 * all. Equally important: this route stores NOTHING. The uploaded document is
 * held in memory for the duration of one request, sent to the extraction
 * model, and discarded. There is no database write, no logging of document
 * content, and no file persisted to disk. The structured result goes straight
 * back to the browser, which owns it from then on.
 */

const MAX_BYTES = 12 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type ErrorBody = { error: string; code: string };

function fail(code: string, error: string, status: number) {
  return NextResponse.json<ErrorBody>({ code, error }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Not a crash — the app is designed to stay usable without a key by
    // falling back to manual entry, so tell the client exactly that.
    return fail(
      "no_api_key",
      "Automatic extraction isn't configured on this deployment. You can still enter results by hand.",
      503
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("bad_request", "Could not read the uploaded file.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("bad_request", "No file was included in the upload.", 400);
  }
  if (file.size === 0) {
    return fail("bad_request", "That file is empty.", 400);
  }
  if (file.size > MAX_BYTES) {
    return fail("too_large", "That file is larger than 12 MB. Try a smaller photo or a single page.", 413);
  }

  const isPdf = file.type === "application/pdf";
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  if (!isPdf && !isImage) {
    return fail(
      "unsupported_type",
      "Upload a PDF or a photo (JPEG, PNG, GIF, or WebP). HEIC photos need to be converted first.",
      415
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const client = new Anthropic({ apiKey });

  const documentBlock = isPdf
    ? ({
        type: "document" as const,
        source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
      })
    : ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: base64,
        },
      });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: EXTRACTION_SYSTEM_PROMPT,
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: EXTRACTION_JSON_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            documentBlock,
            { type: "text", text: "Transcribe every biomarker row printed on this lab report." },
          ],
        },
      ],
    });

    // A refusal returns HTTP 200 with an empty/partial content array — reading
    // content[0] unconditionally would throw here.
    if (response.stop_reason === "refusal") {
      return fail(
        "refused",
        "The extraction service declined to process this document. You can enter the results by hand instead.",
        422
      );
    }
    if (response.stop_reason === "max_tokens") {
      return fail(
        "too_long",
        "This report has more rows than one pass can transcribe. Try uploading one page at a time.",
        422
      );
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) {
      return fail("no_output", "No result came back from extraction. You can enter the results by hand.", 502);
    }

    let parsed: ExtractionResponse;
    try {
      parsed = JSON.parse(textBlock.text) as ExtractionResponse;
    } catch {
      return fail("unparseable", "The extraction result couldn't be read. You can enter the results by hand.", 502);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return fail("rate_limited", "Extraction is busy right now. Wait a moment and try again.", 429);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return fail("auth", "Automatic extraction isn't configured correctly. You can enter results by hand.", 503);
    }
    if (err instanceof Anthropic.APIError) {
      return fail("upstream", "Extraction failed. You can enter the results by hand instead.", 502);
    }
    return fail("unknown", "Something went wrong during extraction. You can enter the results by hand.", 500);
  }
}
