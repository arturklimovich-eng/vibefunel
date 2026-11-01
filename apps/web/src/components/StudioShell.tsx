'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/auth/actions';
import type { StorageMode } from '@/lib/storage-mode';
import { NewFunnelForm } from './NewFunnelForm';
import {
  BookIcon,
  CloseIcon,
  FlowIcon,
  HomeIcon,
  LogoMark,
  LogoutIcon,
  PlusIcon,
  SparkIcon,
} from './EditorIcons';
import styles from './StudioDashboard.module.css';

export type StudioSection = 'overview' | 'docs';

const ShellContext = createContext<{ openCreate: () => void }>({ openCreate: () => {} });

export function useStudioShell() {
  return useContext(ShellContext);
}

export function initials(source: string): string {
  const parts = source.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
  return letters.toUpperCase() || 'VF';
}

export function firstName(email: string | null): string | null {
  if (!email) return null;
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[._+-]/)[0] ?? '';
  if (!/^[a-zA-Z]{2,}$/.test(first)) return null;
  return first[0]?.toUpperCase() + first.slice(1).toLowerCase();
}

export function StudioShell({
  active,
  storage,
  userEmail,
  funnelCount,
  liveCount,
  search,
  children,
}: {
  active: StudioSection;
  storage: StorageMode;
  userEmail: string | null;
  funnelCount: number;
  liveCount: number;
  search?: ReactNode;
  children: ReactNode;
}) {
  const [creating, setCreating] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const name = firstName(userEmail);
  const liveShare = funnelCount > 0 ? (liveCount / funnelCount) * 100 : 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (creating && !dialog.open) dialog.showModal();
    if (!creating && dialog.open) dialog.close();
  }, [creating]);

  const openCreate = () => setCreating(true);

  return (
    <ShellContext.Provider value={{ openCreate }}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/studio" className={styles.brand}>
            <span className={styles.brandMark}>
              <LogoMark size={17} />
            </span>
            <span className={styles.brandName}>VibeFunnels</span>
          </Link>
          <div className={styles.workspace}>
            <span className={styles.workspaceAvatar}>{initials(userEmail ?? 'Vibe Funnels')}</span>
            <span className={styles.workspaceText}>
              <span className={styles.workspaceName}>My workspace</span>
              <span className={styles.workspaceSub}>
                {storage === 'supabase' ? 'Supabase' : 'Local files (dev)'}
              </span>
            </span>
          </div>
          <nav className={styles.nav} aria-label="Studio">
            <Link
              href="/studio"
              className={styles.navItem}
              aria-current={active === 'overview' ? 'page' : undefined}
            >
              <HomeIcon size={17} /> Overview
            </Link>
            <Link
              href={active === 'overview' ? '#funnels' : '/studio#funnels'}
              className={styles.navItem}
            >
              <FlowIcon size={17} /> Funnels
              <span className={styles.navCount}>{funnelCount}</span>
            </Link>
            <Link
              href="/studio/docs"
              className={styles.navItem}
              aria-current={active === 'docs' ? 'page' : undefined}
            >
              <BookIcon size={17} /> Docs
            </Link>
          </nav>
          <div className={styles.planWrap}>
            <div className={styles.planCard}>
              <div className={styles.planHead}>
                <SparkIcon size={15} /> Publishing
              </div>
              <p className={styles.planText}>
                {liveCount} of {funnelCount} funnel{funnelCount === 1 ? '' : 's'} live
              </p>
              <div className={styles.planBar}>
                <span style={{ width: `${liveShare}%` }} />
              </div>
              <button type="button" className={styles.planLink} onClick={openCreate}>
                Create a funnel
              </button>
            </div>
          </div>
          <div className={styles.sidebarFoot}>
            <div className={styles.user}>
              <span className={styles.userAvatar}>{initials(userEmail ?? 'Local dev')}</span>
              <span className={styles.userText}>
                <span className={styles.userName}>
                  {name ?? (userEmail ? 'Signed in' : 'Local developer')}
                </span>
                <span className={styles.userEmail}>{userEmail ?? 'No sign-in in file mode'}</span>
              </span>
              {storage === 'supabase' ? (
                <form action={signOut}>
                  <button
                    type="submit"
                    className={styles.iconBtn}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogoutIcon size={15} />
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <Link href="/studio" className={styles.headerBrand} aria-label="Studio overview">
              <span className={styles.brandMark}>
                <LogoMark size={15} />
              </span>
            </Link>
            <nav className={styles.headerNav} aria-label="Studio sections">
              <Link href="/studio" aria-current={active === 'overview' ? 'page' : undefined}>
                Overview
              </Link>
              <Link href="/studio/docs" aria-current={active === 'docs' ? 'page' : undefined}>
                Docs
              </Link>
            </nav>
            {search}
            <button type="button" className={styles.createBtn} onClick={openCreate}>
              <PlusIcon size={15} /> New funnel
            </button>
          </header>
          <div className={styles.content}>{children}</div>
        </div>

        <dialog
          ref={dialogRef}
          className={styles.modal}
          aria-labelledby="new-funnel-title"
          onClose={() => setCreating(false)}
        >
          <div className={styles.modalHead}>
            <div>
              <h2 id="new-funnel-title" className={styles.modalTitle}>
                New funnel
              </h2>
              <p className={styles.cardSub}>Give it a name and a public link.</p>
            </div>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Close"
              onClick={() => setCreating(false)}
            >
              <CloseIcon size={16} />
            </button>
          </div>
          {creating ? <NewFunnelForm onCancel={() => setCreating(false)} /> : null}
        </dialog>
      </div>
    </ShellContext.Provider>
  );
}
