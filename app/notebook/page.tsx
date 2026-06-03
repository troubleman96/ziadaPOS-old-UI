'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { notebookApi, Note } from '../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const FOLDERS = ['All notes', 'Suppliers', 'Staff', 'Marketing', 'Ideas'] as const;

const TAG_TONE: Record<string, string> = {
  Suppliers: 'accent',
  Supplier:  'accent',
  Staff:     'info',
  Marketing: 'good',
  Ideas:     'warn',
};

function tagPillClass(tag: string) {
  return TAG_TONE[tag] ? `pill ${TAG_TONE[tag]}` : 'pill';
}

function matchesFolder(note: Note, folder: string) {
  if (folder === 'All notes') return true;
  return note.tags.some(
    (t) =>
      t.toLowerCase() === folder.toLowerCase() ||
      t.toLowerCase() === folder.toLowerCase().replace(/s$/, ''),
  );
}

// ─── Three-dot context menu ───────────────────────────────────────────────────

function NoteMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        className="icon-btn"
        style={{ width: 26, height: 26, border: 0, background: 'transparent', fontSize: 15 }}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="Note options"
      >
        ⋯
      </button>
      {open && (
        <div className="note-menu-popup" onClick={(e) => e.stopPropagation()}>
          <button
            className="note-menu-item"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            {Icons.edit} Edit
          </button>
          <button
            className="note-menu-item danger"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            {Icons.trash} Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: Note | null;
  form: { title: string; content: string; tags: string };
  onChange: (patch: Partial<{ title: string; content: string; tags: string }>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
  onClose: () => void;
}

function NoteModal({ open, editing, form, onChange, onSubmit, onDelete, onClose }: ModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => titleRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="note-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="surface note-modal">
        {/* Header */}
        <div className="note-modal-head">
          <span style={{ fontSize: 15, fontWeight: 500 }}>
            {editing ? 'Edit note' : 'New note'}
          </span>
          <button className="icon-btn" style={{ width: 28, height: 28, border: 0 }} onClick={onClose}>
            {Icons.close}
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit}>
          <div className="note-modal-body">
            {/* Title */}
            <div>
              <label className="note-field-label">Title</label>
              <input
                ref={titleRef}
                className="note-input"
                value={form.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Note title…"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="note-field-label">Content</label>
              <textarea
                className="note-textarea"
                value={form.content}
                onChange={(e) => onChange({ content: e.target.value })}
                placeholder="Write your note…"
                rows={8}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="note-field-label">Tags <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(comma-separated)</span></label>
              <input
                className="note-input"
                value={form.tags}
                onChange={(e) => onChange({ tags: e.target.value })}
                placeholder="Suppliers, Ideas, Staff…"
              />
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 5 }}>
                Suggested: Suppliers · Staff · Marketing · Ideas
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="note-modal-foot">
            {editing ? (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                {Icons.trash} Delete note
              </button>
            ) : (
              <div />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Save changes' : 'Create note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotebookPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string>('All notes');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    notebookApi.getNotes().then((res) => {
      setLoading(false);
      if (res.success) {
        const data = res.data as unknown as { results?: Note[] } | Note[];
        if (Array.isArray(data)) setNotes(data);
        else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: Note[] }).results)) {
          setNotes((data as { results: Note[] }).results);
        } else {
          setNotes([]);
        }
      }
    });
  }, []);

  // ── Folder counts ──────────────────────────────────────────────────────────
  const folderCount = (folder: string) =>
    folder === 'All notes'
      ? notes.length
      : notes.filter((n) => matchesFolder(n, folder)).length;

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = notes.filter((n) => matchesFolder(n, activeFolder));
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [notes, activeFolder, query]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm({ title: '', content: '', tags: '' });
    setModalOpen(true);
  };

  const openEdit = (n: Note) => {
    setEditing(n);
    setForm({ title: n.title, content: n.content, tags: n.tags.join(', ') });
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editing) {
      const res = await notebookApi.updateNote(editing.id, { title: form.title, content: form.content, tags });
      if (res.success) {
        setNotes((prev) => prev.map((n) => n.id === editing.id ? res.data : n));
      } else {
        // Optimistic fallback
        setNotes((prev) => prev.map((n) => n.id === editing.id ? { ...n, title: form.title, content: form.content, tags, date_label: 'Just now' } : n));
      }
    } else {
      const res = await notebookApi.createNote({ title: form.title, content: form.content, tags });
      if (res.success) {
        setNotes((prev) => [res.data, ...prev]);
      }
    }
    setModalOpen(false);
  };

  const deleteNote = async (id: string) => {
    await notebookApi.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Delete this note? This cannot be undone.')) deleteNote(id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Notebook' }]}
      actions={
        <button
          onClick={openNew}
          className="btn btn-primary"
          style={{ padding: '7px 12px', fontSize: 13, gap: 6 }}
        >
          {Icons.plus} New note
        </button>
      }
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Notebook <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>
              Daftari
            </span>
          </h1>
          <p className="page-sub">
            Internal memos, ideas, and records for Duka Kuu.
            <span className="mono" style={{ marginLeft: 10, color: 'var(--fg-4)' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 10px 0 12px', height: 34,
            border: '1px solid var(--line)', borderRadius: 7,
            background: 'var(--bg-2)', minWidth: 200,
          }}
        >
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                border: 0, background: 'transparent', cursor: 'pointer',
                color: 'var(--fg-4)', padding: 0, display: 'flex', alignItems: 'center',
              }}
            >
              {Icons.close}
            </button>
          )}
        </div>
      </div>

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <div className="notebook-layout">

        {/* Left: folders sidebar */}
        <div className="surface notebook-sidebar" style={{ padding: 14 }}>
          <div
            className="mono"
            style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2 }}
          >
            Folders
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FOLDERS.map((f) => (
              <button
                key={f}
                className={`note-folder-btn${activeFolder === f ? ' active' : ''}`}
                onClick={() => setActiveFolder(f)}
              >
                <span>{f}</span>
                <span className="note-folder-count">{folderCount(f)}</span>
              </button>
            ))}
          </div>

          {/* New note shortcut */}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 12 }}>
            <button
              onClick={openNew}
              className="btn btn-soft"
              style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, padding: '7px 10px' }}
            >
              {Icons.plus} New note
            </button>
          </div>
        </div>

        {/* Right: notes list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Active filter label */}
          {(activeFolder !== 'All notes' || query.trim()) && (
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', paddingLeft: 2 }}>
              {filtered.length} note{filtered.length !== 1 ? 's' : ''}
              {activeFolder !== 'All notes' && (
                <> in <strong style={{ color: 'var(--fg-2)' }}>{activeFolder}</strong></>
              )}
              {query.trim() && (
                <> matching &ldquo;<strong style={{ color: 'var(--fg-2)' }}>{query}</strong>&rdquo;</>
              )}
              {filtered.length !== notes.length && (
                <button
                  onClick={() => { setActiveFolder('All notes'); setQuery(''); }}
                  style={{ marginLeft: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--mono)', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={{ padding: 48, textAlign: 'center' }}>{SPINNER}</div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div
              className="surface"
              style={{ padding: '52px 24px', textAlign: 'center', borderStyle: 'dashed' }}
            >
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.5 }}>📒</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                {query.trim()
                  ? 'No matching notes'
                  : activeFolder === 'All notes'
                  ? 'No notes yet'
                  : `No notes in ${activeFolder}`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 18 }}>
                {query.trim()
                  ? 'Try a different search term.'
                  : 'Keep ideas, schedules, and supplier notes here.'}
              </div>
              {!query.trim() && (
                <button onClick={openNew} className="btn btn-primary" style={{ fontSize: 12.5, padding: '7px 14px' }}>
                  {Icons.plus} New note
                </button>
              )}
            </div>
          )}

          {/* Note cards */}
          {!loading && filtered.map((n) => (
            <div
              key={n.id}
              className="surface note-card"
              style={{ padding: '16px 18px', cursor: 'pointer' }}
              onClick={() => openEdit(n)}
            >
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, flex: 1, lineHeight: 1.35 }}>
                  {n.title}
                </h3>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', flexShrink: 0, paddingTop: 1 }}>
                  {n.date_label}
                </span>
                <NoteMenu onEdit={() => openEdit(n)} onDelete={() => confirmDelete(n.id)} />
              </div>

              {/* Content preview */}
              <p className="note-preview" style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                {n.content}
              </p>

              {/* Tags */}
              {n.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {n.tags.map((t) => (
                    <span key={t} className={tagPillClass(t)} style={{ fontSize: 10 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Footer count when results exist */}
          {!loading && filtered.length > 0 && (
            <div
              className="mono"
              style={{ fontSize: 11, color: 'var(--fg-4)', textAlign: 'right', paddingTop: 4 }}
            >
              {filtered.length} of {notes.length} notes
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      <NoteModal
        open={modalOpen}
        editing={editing}
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSubmit={submit}
        onDelete={() => editing && confirmDelete(editing.id)}
        onClose={() => setModalOpen(false)}
      />
    </AppShell>
  );
}
