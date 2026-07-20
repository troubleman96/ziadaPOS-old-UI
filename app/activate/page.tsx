'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The trial-payment gate is disabled pre-launch (see components/app-shell.tsx
// and apps/subscriptions/middleware.py on the API side) — this route is kept
// only so old links/bookmarks bounce somewhere sane instead of 404ing.
export default function ActivatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
