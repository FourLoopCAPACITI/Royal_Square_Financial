import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext.jsx';
import { ConnectivityProvider } from './context/ConnectivityContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ConnectivityProvider>
          <AppRoutes />
        </ConnectivityProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
