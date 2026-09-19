import PageHeader from '../../components/common/PageHeader.jsx';
import ChatPanel from '../../components/chat/ChatPanel.jsx';

/** Advisers can preview exactly what clients see from the assistant (demo client context). */
export default function AdviserChat() {
  return (
    <>
      <PageHeader title="Royal Square Assistant" description="Preview the assistant your clients use. It explains the portal and statuses; it never gives advice." />
      <div className="flex h-[min(640px,70vh)] max-w-3xl flex-col overflow-hidden rounded-md border border-brand-border">
        <ChatPanel className="flex-1" />
      </div>
    </>
  );
}
