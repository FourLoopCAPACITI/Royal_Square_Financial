import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext.jsx';
import { ConnectivityProvider } from './context/ConnectivityContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import AppToolbar from './components/layout/AppToolbar.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <NotificationProvider>
          <AppToolbar />
          <ConnectivityProvider>
            <AppRoutes />
          </ConnectivityProvider>
        </NotificationProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
