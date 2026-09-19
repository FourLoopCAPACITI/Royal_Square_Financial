import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-brand-light-grey px-4 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-md border border-brand-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Logo className="max-w-[180px]" />
          <Button as={Link} to="/signup" variant="secondary" size="sm">
            Back to sign up
          </Button>
        </div>

        <h1 className="mb-4 text-3xl font-light">Terms and conditions</h1>

        <div className="space-y-5 text-[15px] leading-7 text-brand-black">
          <p>
            Royal Square Financial provides a digital platform to assist clients and advisers with claims, policy servicing,
            document management, workflow updates, and operational support.
          </p>

          <p>
            By creating an account, you confirm that the information provided is accurate and that you are authorised to use the
            account for the relevant client relationship. You agree to protect your login credentials and use the platform only
            for lawful and approved purposes.
          </p>

          <p>
            The platform is designed to improve visibility of activity and next steps, but it does not replace regulated
            financial advice, legal advice, or insurer decision-making. Claim outcomes, policy decisions, and service approval
            remain subject to the terms of the relevant provider or institution.
          </p>

          <p>
            Approval remains subject to the terms of the relevant provider or institution. Royal Square Financial may update,
            suspend, or remove access to the platform where required for security, compliance, or service continuity.
          </p>

          <p>
            Continued use of the platform constitutes acceptance of the current terms. Users must use the platform responsibly,
            keep personal information accurate, and notify Royal Square Financial immediately if they suspect unauthorised
            account access.
          </p>

          <p>
            All content, branding, workflows, and materials associated with the Platform remain the intellectual property of
            Royal Square Financial or licensed third parties, except where otherwise stated.
          </p>

          <p>
            Royal Square Financial will take reasonable steps to secure personal data and platform access, but no digital
            environment can be guaranteed to be completely secure. Users are responsible for safeguarding their own devices and
            credentials.
          </p>

          <p>
            Royal Square Financial is not liable for indirect, incidental, consequential, or special damages arising from the use
            or inability to use the platform, except where required by law. Use of the platform is governed by the laws of the
            Republic of South Africa.
          </p>
        </div>
      </div>
    </div>
  );
}
