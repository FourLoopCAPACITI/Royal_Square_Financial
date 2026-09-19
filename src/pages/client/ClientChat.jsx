import PageHeader from '../../components/common/PageHeader.jsx';
import ChatPanel from '../../components/chat/ChatPanel.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ClientChat() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t('chat.title')} description={t('chat.clientDescription')} />
      <div className="flex h-[min(640px,70vh)] max-w-3xl flex-col overflow-hidden rounded-md border border-brand-border">
        <ChatPanel className="flex-1" />
      </div>
    </>
  );
}
