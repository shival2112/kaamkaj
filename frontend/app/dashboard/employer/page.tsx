import { redirect } from 'next/navigation';

// Middleware routes employers here; the full employer dashboard lives at /employer/dashboard.
export default function EmployerDashboardRedirect() {
  redirect('/employer/dashboard');
}
