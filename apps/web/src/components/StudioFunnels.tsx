'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, ReactNode } from 'react';
import Link from 'next/link';
import { NavLink, usePendingPush } from './NavPending';
import { useRouter } from 'next/navigation';
import { FUNNEL_GROUPS_ROUTE, funnelGroupRoute, funnelRoutes, readJson } from '@/lib/api-routes';
import type { StorageMode } from '@/lib/storage-mode';
import type { FunnelGroup } from '@/server/funnel-repository';
import type { FunnelRow, OverviewRange } from '@/server/studio-overview';
import { DeleteFunnelButton } from './DeleteFunnelButton';
import { DotsIcon, FlowIcon, FolderIcon, PenIcon, PlusIcon, SearchIcon } from './EditorIcons';
import { NUMBER, formatMoney } from './StudioDashboard';
import { StudioShell, useStudioShell } from './StudioShell';
import styles from './StudioDashboard.module.css';

const ROW_COLORS = ['#f0685d', '#4b7bf5', '#3ccf91', '#f0b552', '#0ea5e9', '#db2777'];

const RANGE_LABEL: Record<OverviewRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  year: 'This year',
};

const NONE = 'none';
const ALL = 'all';

type Filter = typeof ALL | typeof NONE | string;

function useFloatingMenu() {
  const [at, setAt] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const open = at !== null;
  const toggle = () => {
    const rect = ref.current?.getBoundingClientRect();
    setAt(!open && rect ? { top: rect.bottom + 4, right: window.innerWidth - rect.right } : null);
  };
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      ) {
        setAt(null);
      }
    };
    const dismiss = () => setAt(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('resize', dismiss);
    document.addEventListener('scroll', dismiss, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('resize', dismiss);
      document.removeEventListener('scroll', dismiss, true);
    };
  }, [open]);
  return { ref, at, open, toggle, close: () => setAt(null) };
}

function MenuButton({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => ReactNode;
}) {
  const menu = useFloatingMenu();
  return (
    <div className={styles.menuHost} ref={menu.ref}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={label}
        aria-expanded={menu.open}
        onClick={menu.toggle}
      >
        <DotsIcon size={15} />
      </button>
      {menu.at ? (
        <div className={styles.menu} role="menu" style={menu.at}>
          {children(menu.close)}
        </div>
      ) : null}
    </div>
  );
}

function InlineName({
  initial,
  placeholder,
  onSave,
  onCancel,
}: {
  initial: string;
  placeholder: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    const trimmed = value.trim();
    if (save && trimmed && trimmed !== initial) onSave(trimmed.slice(0, 80));
    else onCancel();
  };
  return (
    <input
      className={styles.inlineName}
      value={value}
      maxLength={80}
      placeholder={placeholder}
      aria-label={placeholder}
      autoFocus
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
      }}
    />
  );
}

function FunnelActions({
  row,
  groupId,
  groups,
  onMove,
}: {
  row: FunnelRow;
  groupId: string | null;
  groups: FunnelGroup[];
  onMove: (funnelId: string, groupId: string | null) => void;
}) {
  const targets = [
    ...groups
      .filter((g) => g.id !== groupId)
      .map((g) => ({ id: g.id as string | null, name: g.name })),
    ...(groupId !== null ? [{ id: null, name: 'No project' }] : []),
  ];
  return (
    <div className={styles.rowActions}>
      <NavLink
        href={`/studio/funnels/${row.id}?view=flow`}
        className={styles.iconBtn}
        aria-label={`Open the flow of ${row.name}`}
        title="Flow"
      >
        <FlowIcon size={15} />
      </NavLink>
      <NavLink
        href={`/studio/funnels/${row.id}`}
        className={styles.iconBtn}
        aria-label={`Edit ${row.name}`}
        title="Edit"
      >
        <PenIcon size={15} />
      </NavLink>
      <MenuButton label={`More actions for ${row.name}`}>
        {(close) => (
          <>
            <Link
              href={`/preview/${row.id}`}
              target="_blank"
              role="menuitem"
              className={styles.menuItem}
            >
              Preview draft
            </Link>
            {row.live ? (
              <Link
                href={`/f/${row.slug}`}
                target="_blank"
                role="menuitem"
                className={styles.menuItem}
              >
                Open live page
              </Link>
            ) : null}
            {targets.length > 0 ? (
              <>
                <span className={styles.menuSep} role="separator" />
                <span className={styles.menuLabel}>Move to</span>
                {targets.map((t) => (
                  <button
                    key={t.id ?? NONE}
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={() => {
                      close();
                      onMove(row.id, t.id);
                    }}
                  >
                    {t.name}
                  </button>
                ))}
                <span className={styles.menuSep} role="separator" />
              </>
            ) : null}
            <DeleteFunnelButton
              funnelId={row.id}
              name={row.name}
              role="menuitem"
              className={styles.menuItemDanger}
            >
              Delete funnel
            </DeleteFunnelButton>
          </>
        )}
      </MenuButton>
    </div>
  );
}

export function StudioFunnels({
  funnels,
  groups: initialGroups,
  range,
  storage,
  userEmail,
  liveCount,
  initialQuery,
  initialFilter,
}: {
  funnels: FunnelRow[];
  groups: FunnelGroup[];
  range: OverviewRange;
  storage: StorageMode;
  userEmail: string | null;
  liveCount: number;
  initialQuery: string;
  initialFilter: string;
}) {
  const router = useRouter();
  const pendingPush = usePendingPush();
  const [groups, setGroups] = useState(initialGroups);
  const [moves, setMoves] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  useEffect(() => {
    setMoves((m) => {
      const pending = Object.entries(m).filter(([id, groupId]) => {
        const row = funnels.find((f) => f.id === id);
        return row !== undefined && row.groupId !== groupId;
      });
      return pending.length === Object.keys(m).length ? m : Object.fromEntries(pending);
    });
  }, [funnels]);

  useEffect(() => {
    if (filter !== ALL && filter !== NONE && !groups.some((g) => g.id === filter)) setFilter(ALL);
  }, [filter, groups]);

  const groupOf = (row: FunnelRow): string | null => {
    const moved = moves[row.id];
    const id = moved !== undefined ? moved : row.groupId;
    return id && groups.some((g) => g.id === id) ? id : null;
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return funnels;
    return funnels.filter(
      (f) => f.name.toLowerCase().includes(q) || f.slug.toLowerCase().includes(q),
    );
  }, [funnels, query]);

  const countIn = (id: string | null) => funnels.filter((f) => groupOf(f) === id).length;

  const selectFilter = (next: Filter) => {
    setFilter(next);
    const params = new URLSearchParams(window.location.search);
    if (next === ALL) params.delete('project');
    else params.set('project', next);
    const qs = params.toString();
    window.history.replaceState(null, '', `/studio/funnels${qs ? `?${qs}` : ''}`);
  };

  const fail = (message: string) => {
    setError(message);
    router.refresh();
  };

  const move = async (funnelId: string, groupId: string | null) => {
    const row = funnels.find((f) => f.id === funnelId);
    if (!row || groupOf(row) === groupId) return;
    setError(null);
    setMoves((m) => ({ ...m, [funnelId]: groupId }));
    const revert = () =>
      setMoves((m) => {
        const next = { ...m };
        delete next[funnelId];
        return next;
      });
    try {
      const res = await fetch(funnelRoutes(funnelId).base, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) {
        revert();
        fail(`Could not move the funnel (HTTP ${res.status}).`);
        return;
      }
      router.refresh();
    } catch (moveError) {
      revert();
      fail(moveError instanceof Error ? moveError.message : 'Network error');
    }
  };

  const createGroup = async (name: string) => {
    setAddingGroup(false);
    setError(null);
    try {
      const res = await fetch(FUNNEL_GROUPS_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        fail(`Could not create the project (HTTP ${res.status}).`);
        return;
      }
      const body = await readJson(res);
      const group =
        typeof body === 'object' && body !== null && 'group' in body
          ? (body.group as FunnelGroup)
          : null;
      if (group) {
        setGroups((g) => [...g, group].sort((a, b) => a.name.localeCompare(b.name)));
        selectFilter(group.id);
      }
      router.refresh();
    } catch (createError) {
      fail(createError instanceof Error ? createError.message : 'Network error');
    }
  };

  const renameGroup = async (id: string, name: string) => {
    setRenaming(null);
    setError(null);
    setGroups((g) => g.map((x) => (x.id === id ? { ...x, name } : x)));
    try {
      const res = await fetch(funnelGroupRoute(id), {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) fail(`Could not rename the project (HTTP ${res.status}).`);
      else router.refresh();
    } catch (renameError) {
      fail(renameError instanceof Error ? renameError.message : 'Network error');
    }
  };

  const deleteGroup = async (group: FunnelGroup) => {
    const count = countIn(group.id);
    const note =
      count > 0
        ? ` Its ${count} funnel${count === 1 ? '' : 's'} will stay and move to "No project".`
        : '';
    if (!window.confirm(`Delete the project "${group.name}"?${note}`)) return;
    setError(null);
    try {
      const res = await fetch(funnelGroupRoute(group.id), { method: 'DELETE' });
      if (!res.ok) {
        fail(`Could not delete the project (HTTP ${res.status}).`);
        return;
      }
      setGroups((g) => g.filter((x) => x.id !== group.id));
      if (filter === group.id) selectFilter(ALL);
      router.refresh();
    } catch (deleteError) {
      fail(deleteError instanceof Error ? deleteError.message : 'Network error');
    }
  };

  const dropProps = (key: string, groupId: string | null) => ({
    'data-drop': dragging !== null && dropKey === key ? 'true' : undefined,
    onDragOver: (e: DragEvent) => {
      if (dragging === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dropKey !== key) setDropKey(key);
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setDropKey((k) => (k === key ? null : k));
      }
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const id = dragging ?? e.dataTransfer.getData('text/plain');
      setDragging(null);
      setDropKey(null);
      if (id) void move(id, groupId);
    },
  });

  const sections: { key: string; group: FunnelGroup | null }[] =
    filter === ALL
      ? [...groups.map((g) => ({ key: g.id, group: g })), { key: NONE, group: null }]
      : filter === NONE
        ? [{ key: NONE, group: null }]
        : groups.filter((g) => g.id === filter).map((g) => ({ key: g.id, group: g }));

  const searching = query.trim().length > 0;
  const total = funnels.length;

  return (
    <StudioShell
      active="funnels"
      storage={storage}
      userEmail={userEmail}
      funnelCount={total}
      liveCount={liveCount}
      groups={groups}
      search={
        <label className={styles.search}>
          <SearchIcon size={15} />
          <span className={styles.srOnly}>Search funnels</span>
          <input
            type="search"
            placeholder="Search funnels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      }
    >
      <div className={styles.inner}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Funnels</h1>
            <p className={styles.subtitle}>
              {total} funnel{total === 1 ? '' : 's'} · {groups.length} project
              {groups.length === 1 ? '' : 's'} · stats for {RANGE_LABEL[range].toLowerCase()}
            </p>
          </div>
          <select
            className={styles.rangeSelect}
            aria-label="Period"
            value={range}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set('range', e.target.value);
              pendingPush(`/studio/funnels?${params.toString()}`);
            }}
          >
            {(Object.keys(RANGE_LABEL) as OverviewRange[]).map((r) => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tabs} role="toolbar" aria-label="Projects">
          <button
            type="button"
            className={styles.tab}
            aria-pressed={filter === ALL}
            onClick={() => selectFilter(ALL)}
          >
            All funnels <span className={styles.tabCount}>{total}</span>
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              className={styles.tab}
              aria-pressed={filter === g.id}
              onClick={() => selectFilter(g.id)}
              {...dropProps(`tab:${g.id}`, g.id)}
            >
              <FolderIcon size={14} /> {g.name}
              <span className={styles.tabCount}>{countIn(g.id)}</span>
            </button>
          ))}
          {groups.length > 0 ? (
            <button
              type="button"
              className={styles.tab}
              aria-pressed={filter === NONE}
              onClick={() => selectFilter(NONE)}
              {...dropProps(`tab:${NONE}`, null)}
            >
              No project <span className={styles.tabCount}>{countIn(null)}</span>
            </button>
          ) : null}
          {addingGroup ? (
            <InlineName
              initial=""
              placeholder="Project name"
              onSave={(name) => void createGroup(name)}
              onCancel={() => setAddingGroup(false)}
            />
          ) : (
            <button type="button" className={styles.tabAdd} onClick={() => setAddingGroup(true)}>
              <PlusIcon size={14} /> New project
            </button>
          )}
        </div>

        {error ? (
          <p className={styles.warning} role="alert">
            {error}
          </p>
        ) : null}

        {groups.length === 0 && total > 0 && !searching ? (
          <p className={styles.hint}>
            Group funnels by product, client or launch: create a project, then drag funnels onto it
            or use “Move to” in a funnel’s menu.
          </p>
        ) : null}

        {sections.map(({ key, group }) => {
          const groupId = group ? group.id : null;
          const rows = visible.filter((r) => groupOf(r) === groupId);
          const inGroup = countIn(groupId);
          if (searching && rows.length === 0) return null;
          if (!group && filter === ALL && groups.length > 0 && inGroup === 0) return null;
          const title = group ? group.name : groups.length > 0 ? 'No project' : 'All funnels';
          return (
            <section
              key={key}
              className={styles.card + ' ' + styles.tableCard + ' ' + styles.groupCard}
              aria-label={title}
              {...dropProps(`section:${key}`, groupId)}
            >
              <div className={styles.tableHead}>
                <div className={styles.groupTitle}>
                  <span className={styles.groupIcon} data-none={group ? undefined : 'true'}>
                    <FolderIcon size={16} />
                  </span>
                  <div>
                    {group && renaming === group.id ? (
                      <InlineName
                        initial={group.name}
                        placeholder="Project name"
                        onSave={(name) => void renameGroup(group.id, name)}
                        onCancel={() => setRenaming(null)}
                      />
                    ) : (
                      <h2 className={styles.cardTitle}>{title}</h2>
                    )}
                    <p className={styles.cardSub}>
                      {inGroup} funnel{inGroup === 1 ? '' : 's'}
                      {searching ? ` · ${rows.length} matching “${query.trim()}”` : ''}
                    </p>
                  </div>
                </div>
                <div className={styles.groupActions}>
                  <NewFunnelHere groupId={groupId} />
                  {group ? (
                    <MenuButton label={`Actions for project ${group.name}`}>
                      {(close) => (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            className={styles.menuItem}
                            onClick={() => {
                              close();
                              setRenaming(group.id);
                            }}
                          >
                            Rename project
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className={styles.menuItemDanger}
                            onClick={() => {
                              close();
                              void deleteGroup(group);
                            }}
                          >
                            Delete project
                          </button>
                        </>
                      )}
                    </MenuButton>
                  ) : null}
                </div>
              </div>
              {rows.length > 0 ? (
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Funnel</th>
                        <th scope="col">Status</th>
                        <th scope="col">Leads</th>
                        <th scope="col">Paid</th>
                        <th scope="col">Revenue</th>
                        <th scope="col">
                          <span className={styles.srOnly}>Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const color =
                          ROW_COLORS[funnels.indexOf(row) % ROW_COLORS.length] ?? ROW_COLORS[0];
                        return (
                          <tr
                            key={row.id}
                            style={{ '--row-color': color } as CSSProperties}
                            draggable
                            data-dragging={dragging === row.id ? 'true' : undefined}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', row.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setDragging(row.id);
                            }}
                            onDragEnd={() => {
                              setDragging(null);
                              setDropKey(null);
                            }}
                          >
                            <td>
                              <NavLink
                                href={`/studio/funnels/${row.id}`}
                                className={styles.funnelCell}
                                draggable={false}
                              >
                                <span className={styles.funnelIcon}>
                                  <FlowIcon size={16} />
                                </span>
                                <span>
                                  <b>{row.name}</b>
                                  <small>
                                    {row.screens === null
                                      ? `/${row.slug}`
                                      : `${row.screens} screen${row.screens === 1 ? '' : 's'} · /${row.slug}`}
                                  </small>
                                </span>
                              </NavLink>
                            </td>
                            <td>
                              <span className={styles.status} data-live={row.live}>
                                <i /> {row.live ? 'Live' : 'Draft'}
                              </span>
                            </td>
                            <td>{NUMBER.format(row.leads)}</td>
                            <td>{NUMBER.format(row.paid)}</td>
                            <td>{row.currency ? formatMoney(row.revenue, row.currency) : '—'}</td>
                            <td>
                              <FunnelActions
                                row={row}
                                groupId={groupId}
                                groups={groups}
                                onMove={(id, target) => void move(id, target)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.empty}>
                  {total === 0
                    ? 'No funnels yet. Create your first one to get started.'
                    : group
                      ? 'This project is empty. Drag a funnel here or create a new one.'
                      : 'Every funnel is in a project.'}
                </p>
              )}
            </section>
          );
        })}

        {searching && visible.length === 0 ? (
          <p className={styles.empty}>No funnels match “{query.trim()}”.</p>
        ) : null}
      </div>
    </StudioShell>
  );
}

function NewFunnelHere({ groupId }: { groupId: string | null }) {
  const { openCreate } = useStudioShell();
  return (
    <button type="button" className={styles.smallBtn} onClick={() => openCreate(groupId)}>
      <PlusIcon size={14} /> New funnel
    </button>
  );
}
