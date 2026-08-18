'use client';
import { useCouncil } from '@/hooks/useCouncil';
import Header from '@/components/Header';
import SetupPanel from '@/components/SetupPanel';
import TopicBar from '@/components/TopicBar';
import CouncilChat from '@/components/CouncilChat';

export default function Home() {
  const { agents, saveAgents, session, isRunning, runCouncil } = useCouncil();

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] overflow-hidden">
      <Header session={session} isRunning={isRunning} />
      <div className="flex flex-1 overflow-hidden">
        <SetupPanel agents={agents} onSave={saveAgents} disabled={isRunning} />
        <main className="flex flex-col flex-1 overflow-hidden">
          <TopicBar onStart={runCouncil} disabled={isRunning} agents={agents} />
          <CouncilChat session={session} />
        </main>
      </div>
    </div>
  );
}
