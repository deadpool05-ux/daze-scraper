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
You are Dazeco, an elite custom software and AI development agency.
You want to write a highly engaging, viral, inbound-marketing Reddit post to attract leads.
Analyze the following top posts and pain points from our target audience (Layer: ${layer}):

${postsContext}

CRITICAL INSTRUCTIONS:
1. Identify the most common or highest-value pain point among these posts (e.g., SaaS is too expensive, manual processes, bad CRM, failed MVP, getting scammed by agencies).
2. Write a highly authentic, "no-bullshit" Reddit post that provides a brilliant, contrarian, or highly valuable engineering perspective on solving this problem.
3. Subtly position custom engineering / building bare-metal / owning your tech as the ultimate solution, positioning Dazeco's philosophy as the answer without explicitly pitching "buy from us".
4. The goal is INBOUND leads. People should read this and think "this person knows what they are talking about, I need to DM them".
5. Speak like a normal Reddit user. No emojis, no corporate speak, no AI slop (no "in conclusion", no bullet points if they feel forced). Use lowercase where natural.
6. Based on the tone and content, suggest the single best subreddit from the current layer to post this in (e.g., r/SaaS, r/startups).
7. Provide the output in a JSON format with exactly three keys: "title", "body", and "suggestedSubreddit".

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
