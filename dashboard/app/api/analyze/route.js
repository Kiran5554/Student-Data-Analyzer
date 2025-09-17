import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL || "https://student-backend-j5cc.onrender.com";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fwd = new FormData();
    fwd.append("file", file, file.name || "upload.csv");

    const resp = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      body: fwd,
    });

    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: errText || `Upstream error ${resp.status}` },
        { status: resp.status }
      );
    }

    if (contentType.includes("application/json")) {
      const data = await resp.json();
      return NextResponse.json(data);
    }
    const text = await resp.text();
    return new NextResponse(text, {
      status: 200,
      headers: { "content-type": contentType || "text/plain" },
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
