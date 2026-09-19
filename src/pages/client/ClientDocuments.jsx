import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import DocumentList from '../../components/documents/DocumentList.jsx';
import SmartUpload from '../../components/documents/SmartUpload.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listDocuments } from '../../services/documentService.js';

export default function ClientDocuments() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const documents = useServiceQuery(() => (clientId ? listDocuments({ clientId }) : []), [clientId], { dependsOn: client });
  const attention = documents.data?.filter((d) => d.status !== 'current').length || 0;

  return (
    <>
      <PageHeader title="Documents" description="Your documents in one place. We watch expiry dates so you don't have to." />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Section title="Your documents" count={documents.data?.length}>
          {attention > 0 && <p className="mb-3 text-[14px] text-warn">{attention} {attention === 1 ? 'document needs' : 'documents need'} attention.</p>}
          <QueryState query={documents} loadingLabel="Loading documents">
            {(list) => <DocumentList documents={list} />}
          </QueryState>
        </Section>
        <div>{clientId && <SmartUpload clientId={clientId} />}</div>
      </div>
    </>
  );
}
