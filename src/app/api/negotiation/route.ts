import { NextRequest } from 'next/server';
import { PROVIDER_CONFIG } from '@/lib/providers';
import { Provider } from '@/types';

export async function POST(req: NextRequest) {
  const { provider, model, apiKey, messages, systemPrompt, temperature } = await req.json();

  const config = PROVIDER_CONFIG[provider as Provider];
  if (!config) {
    return new Response('Unknown provider', { status: 400 });
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: typeof temperature === 'number' ? temperature : 0.9,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(`API Error: ${error}`, { status: response.status });
  }

  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
