import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Briefcase, UserRound } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import WorkflowOwner from '../components/workflows/WorkflowOwner.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
import { IS_SUPABASE_CONFIGURED } from '../config/env.js';
import { createWorkflow, advanceWorkflow } from '../utils/workflow.js';

// A sample claim three steps in, used to illustrate the idea on the landing page.
function sampleClaim() {
  let { workflow } = createWorkflow('motor_claim', { clientId: 'sample', providerId: 'p1' });
  for (let i = 0; i < 2; i += 1) workflow = advanceWorkflow(workflow).workflow;
  return workflow;
}

export default function Landing() {
  const { isAuthenticated, role, demoModeEnabled, setDemoRole } = useSession();
  const navigate = useNavigate();

  if (isAuthenticated && role) return <Navigate to={homeFor(role)} replace />;
  if (!demoModeEnabled) return <Navigate to="/login" replace />;

  const enter = (next) => {
    setDemoRole(next);
    navigate(next === 'adviser' ? '/adviser' : '/client');
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo className="max-w-[150px]" />
          {IS_SUPABASE_CONFIGURED && (
            <Link to="/login" className="text-[15px] font-semibold text-brand-red hover:underline">
              Sign in
            </Link>
          )}
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <h1 className="max-w-3xl text-[34px] font-light leading-[1.15] tracking-[0.005em] sm:text-[48px]">
            Always know what is happening, what happens next, and who is holding the ball.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-text-secondary">
            Claims, policy changes, documents and reviews in one place for Royal Square Financial clients and advisers.
          </p>

          <div className="mt-10 max-w-3xl">
            <p className="mb-2 text-[13px] text-brand-grey">A motor claim, right now</p>
            <WorkflowOwner workflow={sampleClaim()} providerName="Santam" viewerRole="client" />
          </div>

          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => enter('client')} className="group flex items-start gap-4 rounded-md border border-brand-border p-5 text-left transition-colors hover:border-brand-red">
              <UserRound className="mt-0.5 text-brand-red" size={22} aria-hidden="true" />
              <span>
                <span className="block font-display text-lg font-medium">Open client view</span>
                <span className="block text-[14px] text-brand-grey">See the portal as Lerato Molefe</span>
              </span>
            </button>
            <button type="button" onClick={() => enter('adviser')} className="group flex items-start gap-4 rounded-md border border-brand-border p-5 text-left transition-colors hover:border-brand-red">
              <Briefcase className="mt-0.5 text-brand-red" size={22} aria-hidden="true" />
              <span>
                <span className="block font-display text-lg font-medium">Open adviser view</span>
                <span className="block text-[14px] text-brand-grey">See the Action Inbox as Sipho Ndlovu</span>
              </span>
            </button>
          </div>
          <p className="mt-4 text-[13px] text-brand-grey">Demo mode uses fictional data. No account needed.</p>
        </main>
      </div>
    </div>
  );
}
