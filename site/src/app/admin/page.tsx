import type { Metadata } from 'next';
import { Admin } from './Admin';

export const metadata: Metadata = {
  title: 'Shop panel',
  robots: { index: false, follow: false },
};

/**
 * The shop panel. The shell is public and holds no data; everything it shows
 * comes from /api/admin/* behind the session cookie, and the password is the
 * ADMIN_PASSWORD secret on the Worker.
 */
export default function AdminPage() {
  return <Admin />;
}
