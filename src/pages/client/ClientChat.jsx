import PageHeader from '../../components/common/PageHeader.jsx';
import ChatPanel from '../../components/chat/ChatPanel.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';

export default function ClientChat() {
  const client = useCurrentClient();
  return (
    <>
      <PageHeader title="Royal Square Assistant" description="Ask how to do something in the portal or what a status means. For advice, speak to your adviser." />
      <div className="flex h-[min(640px,70vh)] max-w-3xl flex-col overflow-hidden rounded-md border border-brand-border">
        <ChatPanel clientId={client.data?.id} className="flex-1" />
      </div>
    </>
  );
}
