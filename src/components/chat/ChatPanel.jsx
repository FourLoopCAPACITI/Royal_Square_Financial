import { useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { answerQuestion, suggestedQuestions } from '../../data/faqs.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

function AssistantMessage({ content }) {
  return (
    <div className="chat-markdown max-w-[85%] rounded-lg bg-brand-light-grey px-3.5 py-2.5 text-[16px] leading-relaxed text-brand-black">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

/** FAQ Bot conversation UI shared by the floating widget and the chat page. Fully client-side. */
export default function ChatPanel({ className = '', autoFocus = false }) {
  const { t, lang } = useI18n();
  // The welcome line is rendered from the active language, not stored, so it always matches the selection.
  const [history, setMessages] = useState([]);
  const messages = [{ role: 'assistant', content: t('chat.welcome') }, ...history];
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  function send(text) {
    const content = text.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', content }, { role: 'assistant', content: answerQuestion(content, lang) }]);
    setInput('');
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' ? (
              <AssistantMessage content={m.content} />
            ) : (
              <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-strong px-3.5 py-2.5 text-[16px] leading-relaxed text-white">{m.content}</p>
            )}
          </div>
        ))}
        {history.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedQuestions(lang).map((q) => (
              <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-brand-border px-3 py-1.5 text-left text-[15px] hover:border-brand-red hover:text-brand-red">
                {q}
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
          <button type="submit" disabled={!input.trim()} className="rounded bg-action px-3 text-white hover:bg-brand-red-dark disabled:opacity-40" aria-label={t('chat.send')}>
            <SendHorizontal size={18} />
          </button>
        </form>
        <p className="mt-2 text-[13.5px] leading-snug text-brand-grey">
          {t('chat.disclaimer')}
        </p>
      </div>
    </div>
  );
}
