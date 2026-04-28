import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';



export async function POST(request: Request) {
  try {
    // Determine which AI service to use based on available keys
    const useGemini = !!process.env.GEMINI_API_KEY;
    const genAI = useGemini ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
    // Ensure at least one API key is present
    if (!useGemini && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing AI service API key (Gemini or Groq)' }, { status: 500 });
    }

    const { posts, layer } = await request.json();

    const model = useGemini ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

    const postsContext = posts.map((p: any, i: number) => `Post ${i+1}:\nTitle: ${p.title}\nContent: ${p.selftext}`).join('\n\n');

    const prompt = `
You are Aaditri GlobalTech, a premium technology studio and Private Limited company.
You want to write a highly engaging, viral, inbound-marketing Reddit post to attract leads.
We are NOT just another agency; we are product builders who prove our capability by shipping our own successful ventures:
- ExitDebt (PAN-based debt intelligence platform)
- myVplayer (COPPA-compliant edtech platform)
- Nyomik (AI-powered wealth algorithms)

Analyze the following top posts and pain points from our target audience (Layer: ${layer}):

${postsContext}

CRITICAL INSTRUCTIONS:
1. Identify the most common or highest-value pain point (e.g., VC rejection, MVP traps, solo founder survival mode, burn rate).
2. Write a highly authentic, "no-bullshit" Reddit post using the "Aaditri Framework":
   - ACKNOWLEDGE THE RAW EMOTION: Start with the frustration (e.g., "getting rejected by an Indian VC for a seed round is broken").
   - INJECT TECHNICAL REALITY: Provide a contrarian engineering perspective (e.g., "you don't need a massive team, you need a fast, heavily-optimized MERN stack").
   - THE CURIOSITY GAP (SOFT PITCH): Position Aaditri as the answer by mentioning we build our own products (ExitDebt/myVplayer) and architect "bare-metal" systems for clients.
3. Speak like a normal Reddit user. No emojis, no corporate speak, no AI slop. Use lowercase where natural.
4. Suggest the single best subreddit from the current layer (e.g., r/StartupIndia, r/SaaS).
5. Provide output in JSON: {"title": "...", "body": "...", "suggestedSubreddit": "..."}.

Return ONLY valid JSON.
    `;

    if (useGemini) {
      try {
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return NextResponse.json(JSON.parse(cleanText));
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
      }
    }
    // Fallback to Groq
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY for fallback' }, { status: 500 });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that only responds in valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    const data: any = await groqResponse.json();
    if (data.error) {
      return NextResponse.json({ error: 'Groq API Error', details: data.error }, { status: 500 });
    }

    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';
    try {
      return NextResponse.json(JSON.parse(content));
    } catch (parseError) {
      return NextResponse.json({ error: 'Failed to parse response from Groq', raw: content }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
