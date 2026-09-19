import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext.jsx';
import { ConnectivityProvider } from './context/ConnectivityContext.jsx';
import { LanguageKey, LanguageProvider } from './i18n/I18nContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <LanguageProvider>
          <ConnectivityProvider>
            <LanguageKey>
              <AppRoutes />
            </LanguageKey>
          </ConnectivityProvider>
        </LanguageProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
