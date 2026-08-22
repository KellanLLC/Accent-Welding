import { notFound } from 'next/navigation';

/**
 * Anything that matches no real route lands here, inside the site layout, so
 * the 404 page keeps the nav and footer. Static assets never reach this: they
 * are served before the app sees the request.
 */
export default function CatchAll() {
  notFound();
}
