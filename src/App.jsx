import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext.jsx';
import { ConnectivityProvider } from './context/ConnectivityContext.jsx';
import { LanguageKey, LanguageProvider } from './i18n/I18nContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import AppToolbar from './components/layout/AppToolbar.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <LanguageProvider>
          <NotificationProvider>
            <AppToolbar />
            <ConnectivityProvider>
              <LanguageKey>
                <AppRoutes />
              </LanguageKey>
            </ConnectivityProvider>
          </NotificationProvider>
        </LanguageProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
