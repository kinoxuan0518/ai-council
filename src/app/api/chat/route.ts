import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { provider, model, apiKey, messages, systemPrompt } = await req.json();

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 800,
      }),
    });

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  if (provider === 'google') {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\nNow begin.' }] },
          { role: 'model', parts: [{ text: 'Understood. I am ready.' }] },
          ...geminiMessages,
        ],
        generationConfig: { maxOutputTokens: 800 },
      }),
    });

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  return new Response('Unknown provider', { status: 400 });
}
