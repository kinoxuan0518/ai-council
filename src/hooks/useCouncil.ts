'use client';
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Agent, Message, CouncilSession } from '@/types';
import { DEFAULT_AGENTS } from '@/lib/defaults';
import { ROLE_CONFIG } from '@/lib/providers';
import { parseOpenAIStream, parseAnthropicStream, parseGoogleStream } from '@/lib/stream';

const STORAGE_KEY = 'ai-council-agents';

export function useCouncil() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [session, setSession] = useState<CouncilSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAgents(JSON.parse(stored));
      } catch {
        setAgents(DEFAULT_AGENTS);
      }
    } else {
      setAgents(DEFAULT_AGENTS);
    }
  }, []);

  const saveAgents = useCallback((newAgents: Agent[]) => {
    setAgents(newAgents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgents));
  }, []);

  const streamAgentResponse = useCallback(async (
    agent: Agent,
    conversationMessages: { role: string; content: string }[],
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    const roleConfig = ROLE_CONFIG[agent.role];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: agent.provider,
        model: agent.model,
        apiKey: agent.apiKey,
        messages: conversationMessages,
        systemPrompt: roleConfig.systemPrompt,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`API error: ${response.status} ${await response.text()}`);
    }

    let fullContent = '';
    let generator: AsyncGenerator<string>;

    if (agent.provider === 'openai') {
      generator = parseOpenAIStream(response.body);
    } else if (agent.provider === 'anthropic') {
      generator = parseAnthropicStream(response.body);
    } else {
      generator = parseGoogleStream(response.body);
    }

    for await (const chunk of generator) {
      fullContent += chunk;
      onChunk(chunk);
    }

    return fullContent;
  }, []);

  const runCouncil = useCallback(async (topic: string) => {
    const enabledAgents = agents.filter(a => a.enabled && a.apiKey);
    if (enabledAgents.length === 0) return;

    setIsRunning(true);
    const newSession: CouncilSession = {
      id: uuidv4(),
      topic,
      messages: [],
      status: 'discussing',
      createdAt: new Date(),
    };
    setSession(newSession);

    const conversationHistory: { role: string; content: string; agentName: string }[] = [];
    const topicMessage = { role: 'user', content: `议题：${topic}` };

    const discussionAgents = enabledAgents.filter(a => a.role !== 'moderator');
    const moderator = enabledAgents.find(a => a.role === 'moderator');

    for (const agent of discussionAgents) {
      const msgId = uuidv4();

      const agentMessages = [
        topicMessage,
        ...conversationHistory.map(h => ({
          role: 'user',
          content: `[${h.agentName}的观点]: ${h.content}`,
        })),
      ];

      const placeholderMsg: Message = {
        id: msgId,
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
        agentColor: agent.color,
        agentAvatar: agent.avatar,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setSession(prev =>
        prev
          ? { ...prev, messages: [...prev.messages, placeholderMsg] }
          : null
      );

      try {
        let fullContent = '';
        await streamAgentResponse(agent, agentMessages, (chunk) => {
          fullContent += chunk;
          setSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === msgId ? { ...m, content: fullContent } : m
              ),
            };
          });
        });

        setSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === msgId ? { ...m, isStreaming: false } : m
            ),
          };
        });

        conversationHistory.push({
          role: 'assistant',
          content: fullContent,
          agentName: agent.name,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === msgId
                ? { ...m, content: `[Error: ${errorMsg}]`, isStreaming: false }
                : m
            ),
          };
        });
      }
    }

    if (moderator) {
      setSession(prev => (prev ? { ...prev, status: 'synthesizing' } : null));

      const msgId = uuidv4();
      const synthesisPrompt = [
        topicMessage,
        ...conversationHistory.map(h => ({
          role: 'user',
          content: `[${h.agentName}的观点]:\n${h.content}`,
        })),
        {
          role: 'user',
          content: '请综合以上所有观点，输出最终决议方案。',
        },
      ];

      const placeholderMsg: Message = {
        id: msgId,
        agentId: moderator.id,
        agentName: moderator.name,
        agentRole: moderator.role,
        agentColor: moderator.color,
        agentAvatar: moderator.avatar,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isFinal: true,
      };

      setSession(prev =>
        prev
          ? { ...prev, messages: [...prev.messages, placeholderMsg] }
          : null
      );

      try {
        let fullContent = '';
        await streamAgentResponse(moderator, synthesisPrompt, (chunk) => {
          fullContent += chunk;
          setSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === msgId ? { ...m, content: fullContent } : m
              ),
            };
          });
        });

        setSession(prev =>
          prev
            ? {
                ...prev,
                status: 'done',
                messages: prev.messages.map(m =>
                  m.id === msgId ? { ...m, isStreaming: false } : m
                ),
              }
            : null
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setSession(prev =>
          prev
            ? {
                ...prev,
                status: 'done',
                messages: prev.messages.map(m =>
                  m.id === msgId
                    ? { ...m, content: `[Error: ${errorMsg}]`, isStreaming: false }
                    : m
                ),
              }
            : null
        );
      }
    } else {
      setSession(prev => (prev ? { ...prev, status: 'done' } : null));
    }

    setIsRunning(false);
  }, [agents, streamAgentResponse]);

  return {
    agents,
    saveAgents,
    session,
    setSession,
    isRunning,
    runCouncil,
  };
}
