import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini isn't connected yet. Add GEMINI_API_KEY to .env.local and restart the dev server." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const role = typeof body.role === "string" ? body.role : "Trainee";
    const language = body.language === "hi" ? "Hindi" : "English";
    if (!message) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `You are Sarthi, a helpful career and skills guide inside Yogya, a prototype connecting trainees, trainers, institutes, employers, and government. The current user's demo role is ${role}. Give concise, practical guidance. Respond in ${language} for this chatbot conversation. If Hindi is selected, use clear, natural Hindi (Devanagari script) while keeping common technical terms such as CNC, MRI, Gemini, and job titles understandable. Be transparent when information is illustrative and do not invent live job listings. User question: ${message}`,
    });
    return NextResponse.json({ answer: response.text || "I couldn't generate a response. Please try again." });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Gemini request failed. Check your API key, model access, and network connection." },
      { status: 500 }
    );
  }
}