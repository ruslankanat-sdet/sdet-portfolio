'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { IDEShell } from '@/components/ide/IDEShell';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { DoorScreen } from '@/components/door/DoorScreen';
import { RecruiterView } from '@/components/recruiter/RecruiterView';

const MODE_KEY = 'resume-mode';
type Mode = 'recruiter' | 'ide' | null;

function readStoredMode(): Mode {
  try {
    const val = localStorage.getItem(MODE_KEY);
    if (val === 'recruiter' || val === 'ide') return val;
    return null;
  } catch {
    return null;
  }
}

function clearStoredMode(): void {
  try { localStorage.removeItem(MODE_KEY); } catch {}
}

function ResumeGateInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') !== null) {
      clearStoredMode();
      setMode(null);
      // Remove ?reset from the address bar so a page refresh doesn't re-clear
      router.replace('/');
    } else {
      setMode(readStoredMode());
    }
    setMounted(true);
  }, [searchParams, router]);

  // Prevent flash of wrong content during SSR / hydration
  if (!mounted) {
    return <div style={{ background: '#06090e', height: '100dvh' }} />;
  }

  if (mode === 'ide') {
    return (
      <>
        <SiteHeader />
        <main className="site-main">
          <IDEShell />
        </main>
      </>
    );
  }

  if (mode === 'recruiter') {
    return (
      <RecruiterView
        onSwitchToIDE={() => {
          try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
          setMode('ide');
        }}
      />
    );
  }

  return (
    <DoorScreen
      onChooseRecruiter={() => {
        try { localStorage.setItem(MODE_KEY, 'recruiter'); } catch {}
        setMode('recruiter');
      }}
      onChooseIDE={() => {
        try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
        setMode('ide');
      }}
    />
  );
}

export default function ResumeGate() {
  return (
    <Suspense fallback={<div style={{ background: '#06090e', height: '100dvh' }} />}>
      <ResumeGateInner />
    </Suspense>
  );
}
