import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY in environment variables. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const { postTitle, postText, subreddit } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are drafting a Reddit comment reply on behalf of Dazeco, an elite custom software and AI development agency.
You are replying to this post in r/${subreddit}:
Title: ${postTitle}
Content: ${postText}

CRITICAL RULES FOR YOUR REPLY:
1. Speak exactly like a normal Reddit user. Use all lowercase (or minimal capitalization), use abbreviations (rn, tbh, tbh, afaik, imo, wtf, dm).
2. NO AI SLOP. Absolutely NO bullet points, NO dashes, NO emojis, NO "hello there", NO "in conclusion", NO corporate speak.
3. Be brutally honest and direct. The "no-bullshit" engineering authority.
4. The strategy is the "Trojan Horse Audit". Don't say "hire us". Say something like "your architecture is probably what's killing you rn. stop renting SaaS and just build a bare metal mvp. dm me if u want me to audit your stack" or "if u need this built without diluting equity to 0, hit my inbox".
5. Keep it short. 2-4 sentences max.
6. Provide ONLY the exact text to paste into the comment box. Nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ draft: text.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
