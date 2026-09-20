import { Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import TermsAndConditions from '../pages/TermsAndConditions.jsx';
import Roadmap from '../pages/Roadmap.jsx';
import WorkflowDetail from '../pages/WorkflowDetail.jsx';
import AccidentAssist from '../pages/AccidentAssist.jsx';
import NotFound from '../pages/NotFound.jsx';
import { clientRoutes } from './clientRoutes.jsx';
import { adviserRoutes } from './adviserRoutes.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/roadmap" element={<Roadmap />} />

      <Route element={<ProtectedRoute allow={['client', 'adviser', 'admin']} />}>
        <Route element={<AppShell />}>
          <Route element={<ProtectedRoute allow={['client']} />}>{clientRoutes}</Route>
          <Route element={<ProtectedRoute allow={['adviser', 'admin']} />}>{adviserRoutes}</Route>
          <Route path="/workflow/:id" element={<WorkflowDetail />} />
          <Route path="/accident-assist" element={<AccidentAssist />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
