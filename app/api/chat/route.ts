import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local and restart dev server." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const role = typeof body.role === "string" ? body.role : "Trainee";
    const language = body.language === "hi" ? "Hindi (Devanagari script)" : "English";
    if (!message) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey });

    // Robust candidate model fallback list prioritized by tested availability
    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    let textResponse = "";
    let lastError: any = null;

    const roleGuidanceContext = `You are Sarthi, an expert AI mentor and strategic advisor inside Yogya (India's national skills and workforce intelligence platform).
The current user's workspace role is: ${role}.
Language of response: ${language}.

Role context guidelines:
- If Trainee: Give encouraging, practical guidance on hands-on skills, machine simulations (CNC, MRI), portfolio evidence, NSQF certification, and career roadmaps.
- If Trainer: Provide actionable lesson plans, workshop safety tips, assessment rubrics, and industry alignment advice.
- If Industry: Provide talent matching recommendations, job-ready skill requirements (Fanuc CNC, MIG/TIG, CMM quality inspection), and Board of Studies syllabus improvement tips for local ITIs.
- If Institute: Offer advice on lab equipment utilization, placement readiness, faculty development, and aligning course capacity with district demand.
- If Ministry: Provide policy and workforce intelligence for district-level skilling (e.g. Kolhapur district, Gokul Shirgaon & Shiroli MIDC clusters), institutional capacity balancing, and apprenticeship programs.

Response formatting:
- Be concise, structured, and practical.
- Use clear bullet points or short paragraphs.
- If illustrative data or numbers are discussed, note they are prototype estimates.
User's Question: ${message}`;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: roleGuidanceContext,
        });
        textResponse = response.text || "";
        if (textResponse) break;
      } catch (err: any) {
        lastError = err;
        const status = Number(err?.status || err?.error?.code || 0);
        // Continue to the next candidate model on 404, 503 (high demand), 429 (rate limit), or temporary errors
        if (
          status === 404 ||
          status === 503 ||
          status === 429 ||
          /not found|is not supported|no longer available|high demand|temporarily unavailable|overloaded|rate limit|quota/i.test(
            String(err?.message || err?.error?.message || "")
          )
        ) {
          continue;
        }
        break;
      }
    }

    if (!textResponse && lastError) {
      throw lastError;
    }

    return NextResponse.json({
      answer: textResponse || "I am currently reviewing your query. Please try asking again in a moment.",
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    const err = error as { status?: number; message?: string; error?: { code?: number; message?: string; status?: string } };
    const upstreamStatus = Number(err?.status || err?.error?.code || 0);
    if (upstreamStatus === 503 || /high demand|temporarily unavailable|overloaded/i.test(String(err?.message || err?.error?.message || ""))) {
      return NextResponse.json({ error: "Gemini is temporarily busy. Please wait a moment and try again." }, { status: 503 });
    }
    if (upstreamStatus === 429 || /rate limit|quota/i.test(String(err?.message || err?.error?.message || ""))) {
      return NextResponse.json({ error: "Gemini rate limit reached. Please wait a moment before trying again." }, { status: 429 });
    }
    return NextResponse.json(
      { error: "Gemini request failed. Check your API key, model access, and network connection." },
      { status: upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 500 }
    );
  }
}