import PageHeader from '../../components/common/PageHeader.jsx';
import ChatPanel from '../../components/chat/ChatPanel.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ClientChat() {
  const { t } = useI18n();
  const client = useCurrentClient();
  return (
    <>
      <PageHeader title={t('chat.title')} description={t('chat.clientDescription')} />
      <div className="flex h-[min(640px,70vh)] max-w-3xl flex-col overflow-hidden rounded-md border border-brand-border">
        <ChatPanel clientId={client.data?.id} className="flex-1" />
      </div>
    </>
  );
}
