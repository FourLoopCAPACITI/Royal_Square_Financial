/** Adviser portal routes. */
import { Route } from 'react-router-dom';
import AdviserDashboard from '../pages/adviser/AdviserDashboard.jsx';
import ActionInbox from '../pages/adviser/ActionInbox.jsx';
import AdviserClients from '../pages/adviser/AdviserClients.jsx';
import AdviserWorkflows from '../pages/adviser/AdviserWorkflows.jsx';
import AdviserGoals from '../pages/adviser/AdviserGoals.jsx';
import AdviserDocuments from '../pages/adviser/AdviserDocuments.jsx';
import AdviserClaims from '../pages/adviser/AdviserClaims.jsx';
import AdviserRequests from '../pages/adviser/AdviserRequests.jsx';
import AdviserProviders from '../pages/adviser/AdviserProviders.jsx';
import AdviserChat from '../pages/adviser/AdviserChat.jsx';
import AdviserProfile from '../pages/adviser/AdviserProfile.jsx';

export const adviserRoutes = (
  <>
    <Route path="/adviser" element={<AdviserDashboard />} />
    <Route path="/adviser/actions" element={<ActionInbox />} />
    <Route path="/adviser/clients" element={<AdviserClients />} />
    <Route path="/adviser/workflows" element={<AdviserWorkflows />} />
    <Route path="/adviser/goals" element={<AdviserGoals />} />
    <Route path="/adviser/documents" element={<AdviserDocuments />} />
    <Route path="/adviser/claims" element={<AdviserClaims />} />
    <Route path="/adviser/requests" element={<AdviserRequests />} />
    <Route path="/adviser/providers" element={<AdviserProviders />} />
    <Route path="/adviser/chat" element={<AdviserChat />} />
    <Route path="/adviser/profile" element={<AdviserProfile />} />
  </>
);
