/** Client portal routes. Owned by feature/client-ui. */
import { Route } from 'react-router-dom';
import ClientDashboard from '../pages/client/ClientDashboard.jsx';
import ClientActions from '../pages/client/ClientActions.jsx';
import ClientGoals from '../pages/client/ClientGoals.jsx';
import ClientDocuments from '../pages/client/ClientDocuments.jsx';
import ClientClaims from '../pages/client/ClientClaims.jsx';
import ClientRequests from '../pages/client/ClientRequests.jsx';
import LifeEvents from '../pages/client/LifeEvents.jsx';
import ClientChat from '../pages/client/ClientChat.jsx';
import ClientProfile from '../pages/client/ClientProfile.jsx';
import Notifications from '../pages/Notifications.jsx';

export const clientRoutes = (
  <>
    <Route path="/client/notifications" element={<Notifications />} />
    <Route path="/client" element={<ClientDashboard />} />
    <Route path="/client/actions" element={<ClientActions />} />
    <Route path="/client/goals" element={<ClientGoals />} />
    <Route path="/client/documents" element={<ClientDocuments />} />
    <Route path="/client/claims" element={<ClientClaims />} />
    <Route path="/client/requests" element={<ClientRequests />} />
    <Route path="/client/life-events" element={<LifeEvents />} />
    <Route path="/client/chat" element={<ClientChat />} />
    <Route path="/client/profile" element={<ClientProfile />} />
  </>
);
