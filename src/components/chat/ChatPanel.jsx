import { useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage, SUGGESTED_QUESTION_KEYS } from '../../services/chatService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { DEMO_CLIENT_ID } from '../../data/mockData.js';

function AssistantMessage({ content }) {
  return (
    <div className="chat-markdown max-w-[85%] rounded-lg bg-brand-light-grey px-3.5 py-2.5 text-[14.5px] leading-relaxed text-brand-black">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

/** Conversation UI shared by the floating widget and the Chat Assistant page. */
export default function ChatPanel({ clientId = DEMO_CLIENT_ID, className = '', autoFocus = false }) {
  const { t, lang } = useI18n();
  // The welcome line is rendered from the active language, not stored, so it always matches the selection.
  const [history, setMessages] = useState([]);
  const messages = [{ role: 'assistant', content: t('chat.welcome') }, ...history];
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [usedGuide, setUsedGuide] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, sending]);

  async function send(text) {
    const content = text.trim();
    if (!content || sending) return;
    const next = [...history, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setSending(true);
    const { reply, source } = await sendChatMessage(next, { clientId });
    if (source === 'guide') setUsedGuide(true);
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setSending(false);
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' ? (
              <AssistantMessage content={m.content} />
            ) : (
              <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-strong px-3.5 py-2.5 text-[14.5px] leading-relaxed text-white">{m.content}</p>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-[14px] text-brand-grey" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {t('chat.thinking')}
          </div>
        )}
        {history.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_QUESTION_KEYS.map((key) => (
              <button key={key} type="button" onClick={() => send(t(key))} className="rounded-full border border-brand-border px-3 py-1.5 text-left text-[13.5px] hover:border-brand-red hover:text-brand-red">
                {t(key)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-brand-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            {t('chat.askLabel')}
          </label>
          <input
            id="chat-input"
            className="field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            lang={lang}
            autoFocus={autoFocus}
            autoComplete="off"
          />
          <button type="submit" disabled={!input.trim() || sending} className="rounded bg-action px-3 text-white hover:bg-brand-red-dark disabled:opacity-40" aria-label={t('chat.send')}>
            <SendHorizontal size={18} />
          </button>
        </form>
        <p className="mt-2 text-[12px] leading-snug text-brand-grey">
          {t('chat.disclaimer')}
          {usedGuide && t('chat.usedGuide')}
        </p>
      </div>
    </div>
  );
}
