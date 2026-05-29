import { redirect } from 'next/navigation';

// Middleware routes candidates here; the full dashboard lives at /dashboard.
export default function CandidateDashboardRedirect() {
  redirect('/dashboard');
}
