import { formatZAR } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function NetWorthSummary({ assets = 0, liabilities = 0 }) {
  const { t } = useI18n();
  const netWorth = assets - liabilities;
  return (
    <div className="rounded-md border border-brand-border p-5">
      <p className="text-[14.5px] text-brand-grey">{t('netWorth.title')}</p>
      <p className="mt-1 font-display text-[30px] font-light tabular-nums leading-none">{formatZAR(netWorth)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-border pt-3 text-[15.5px]">
        <div>
          <dt className="text-brand-grey">{t('netWorth.assets')}</dt>
          <dd className="font-semibold tabular-nums">{formatZAR(assets)}</dd>
        </div>
        <div>
          <dt className="text-brand-grey">{t('netWorth.liabilities')}</dt>
          <dd className="font-semibold tabular-nums">{formatZAR(liabilities)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[14px] text-brand-grey">{t('netWorth.note')}</p>
    </div>
  );
}
