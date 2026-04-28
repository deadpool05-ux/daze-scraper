import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Removed global initialization to support dynamic fallback


export async function POST(request: Request) {
  try {
    const useGemini = !!process.env.GEMINI_API_KEY;
    const useGroq = !!process.env.GROQ_API_KEY;

    if (!useGemini && !useGroq) {
      return NextResponse.json(
        { error: 'Missing AI service API key (Gemini or Groq).' },
        { status: 500 }
      );
    }

    const { postTitle, postText, subreddit } = await request.json();

    const genAI = useGemini ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!) : null;
    const model = useGemini ? genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

    const prompt = `
You are drafting a Reddit comment reply on behalf of Aaditri GlobalTech.

ABOUT AADITRI GLOBALTECH:
Aaditri GlobalTech is a premium technology studio and Private Limited company. We don't just build for clients; we build and run our own successful SaaS products.
- PRODUCTS: ExitDebt (debt intelligence), myVplayer (kid-safe edtech), Nyomik (AI wealth).
- EXPERTISE: MERN Stack, Python automation, AWS Cloud, Fintech, AI/ML orchestration.
- We favor custom, "bare-metal" systems over bloated third-party CRMs to give clients total data ownership.
- Every engineering decision we make is backed by the fact that we ship production-grade products ourselves.

You are replying to this post in r/${subreddit}:
Title: ${postTitle}
Content: ${postText}

CRITICAL RULES FOR YOUR REPLY:
1. Speak exactly like a normal Reddit user. Use all lowercase (or minimal capitalization), use abbreviations (rn, tbh, afaik, imo, wtf, dm).
2. NO AI SLOP. Absolutely NO bullet points, NO dashes, NO emojis, NO "hello there", NO "in conclusion", NO corporate speak.
3. Be brutally honest and direct. The "no-bullshit" engineering authority.
4. The strategy is the "Trojan Horse Audit". Subtly tie their problem back to something Dazeco does (like custom CRMs, AI automation, or scalable architecture).
5. NEVER DROP A LINK. Do NOT mention "dazeco.in" or any URLs. Reddit mods will ban you for self-promotion. Instead, tell them to "dm me" or "hit my inbox" if they want an audit or need it built properly.
6. Keep it short. 2-4 sentences max.
7. Provide ONLY the exact text to paste into the comment box. Nothing else.
`;

    if (useGemini) {
      try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ draft: text.trim() });
      } catch (geminiError) {
        if (!useGroq) throw geminiError;
      }
    }

    // Fallback to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data: any = await groqResponse.json();
    if (data.error) {
      return NextResponse.json({ error: 'Groq API Error', details: data.error }, { status: 500 });
    }

    const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ draft: text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
