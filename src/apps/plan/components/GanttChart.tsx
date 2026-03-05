import { useRef, useState, useCallback, useEffect } from 'react';
import { PlanTask, PlanGroup, PlanDeadline, TimeScale, TaskStatus } from '../types';
import {
  STATUS_COLORS, daysDiff, weekStart, addWeeks, monthStart, addMonths,
  weekNumber, quarterOf, toISO,
} from '../utils';
import { ChevronDown, Pencil, Trash2, Check } from 'lucide-react';

const SWISS_FONT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const ROW_H = 42;
const LABEL_W = 200;
const COL_W_WEEK = 30;
const COL_W_MONTH = 84;

interface Props {
  tasks: PlanTask[];
  groups: PlanGroup[];
  deadlines: PlanDeadline[];
  scale: TimeScale;
  groupBy: 'client' | 'phase';
  onUpdateTask: (id: string, updates: Partial<PlanTask>) => void;
  onDeleteTask: (id: string) => void;
  onCreateGroup: (name: string, type: 'client' | 'phase') => void;
  onUpdateGroup?: (id: string, name: string) => void;
  onDeleteGroup?: (id: string) => void;
  onDeleteDeadline?: (id: string) => void;
}

// ── Column grid ───────────────────────────────────────────────────────────────
const buildColumns = (scale: TimeScale, tasks: PlanTask[]) => {
  const allDates = tasks.flatMap(t => [new Date(t.start_date), new Date(t.end_date)]);
  const today = new Date();
  allDates.push(today);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  if (scale === 'weeks') {
    const start = weekStart(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    const end = weekStart(new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 1));
    const cols: Date[] = [];
    let cur = new Date(start);
    while (cur <= end) { cols.push(new Date(cur)); cur = addWeeks(cur, 1); }
    return { cols, start, colW: COL_W_WEEK };
  } else {
    const start = monthStart(new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1));
    const end = monthStart(new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 1));
    const cols: Date[] = [];
    let cur = new Date(start);
    while (cur <= end) { cols.push(new Date(cur)); cur = addMonths(cur, 1); }
    return { cols, start, colW: COL_W_MONTH };
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Component ─────────────────────────────────────────────────────────────────
const GanttChart = ({
  tasks, groups, deadlines, scale, onUpdateTask, onDeleteTask,
  onCreateGroup, onUpdateGroup, onDeleteGroup, onDeleteDeadline,
}: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // ── Drag / resize ──────────────────────────────────────────────────────────
  type DragInfo = {
    taskId: string;
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    origStart: string;
    origEnd: string;
  };
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const [preview, setPreview] = useState<{ taskId: string; start_date: string; end_date: string } | null>(null);

  // ── Selection & editing ────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  // ── Group picker ───────────────────────────────────────────────────────────
  const [groupPickerId, setGroupPickerId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameGroupDraft, setRenameGroupDraft] = useState('');

  const hasData = tasks.length > 0;
  const { cols, start, colW } = hasData
    ? buildColumns(scale, tasks)
    : { cols: [] as Date[], start: new Date(), colW: COL_W_MONTH };
  const today = new Date();

  const dateToX = useCallback((date: Date): number => {
    const totalDays = daysDiff(start, date);
    if (scale === 'weeks') return (totalDays / 7) * colW;
    const mIdx = cols.findIndex(c => c.getFullYear() === date.getFullYear() && c.getMonth() === date.getMonth());
    if (mIdx === -1) return cols.length * colW;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return mIdx * colW + (date.getDate() / daysInMonth) * colW;
  }, [start, scale, colW, cols]);

  // Quarter spans
  const quarterSpans: { label: string; startCol: number; span: number }[] = [];
  if (scale === 'months') {
    let i = 0;
    while (i < cols.length) {
      const q = quarterOf(cols[i].getMonth());
      const yr = cols[i].getFullYear();
      let j = i;
      while (j < cols.length && quarterOf(cols[j].getMonth()) === q && cols[j].getFullYear() === yr) j++;
      quarterSpans.push({ label: `Q${q} ${yr}`, startCol: i, span: j - i });
      i = j;
    }
  }

  const totalW = cols.length * colW;
  const todayX = dateToX(today);

  const sortedTasks = [...tasks].sort((a, b) => {
    const ga = groups.findIndex(g => g.id === a.group_id);
    const gb = groups.findIndex(g => g.id === b.group_id);
    if (ga !== gb) return ga - gb;
    return a.row_order - b.row_order;
  });

  // ── Compute snapped dates from drag delta ──────────────────────────────────
  const computeDates = useCallback((
    dx: number, origStart: string, origEnd: string, type: DragInfo['type']
  ): { start_date: string; end_date: string } => {
    const origS = new Date(origStart);
    const origE = new Date(origEnd);
    if (scale === 'weeks') {
      const weeks = Math.round(dx / colW);
      if (type === 'move') return { start_date: toISO(addWeeks(origS, weeks)), end_date: toISO(addWeeks(origE, weeks)) };
      if (type === 'resize-right') { const ne = addWeeks(origE, weeks); return { start_date: origStart, end_date: ne > origS ? toISO(ne) : origEnd }; }
      const ns = addWeeks(origS, weeks); return { start_date: ns < origE ? toISO(ns) : origStart, end_date: origEnd };
    } else {
      const months = Math.round(dx / colW);
      if (type === 'move') return { start_date: toISO(addMonths(origS, months)), end_date: toISO(addMonths(origE, months)) };
      if (type === 'resize-right') { const ne = addMonths(origE, months); return { start_date: origStart, end_date: ne > origS ? toISO(ne) : origEnd }; }
      const ns = addMonths(origS, months); return { start_date: ns < origE ? toISO(ns) : origStart, end_date: origEnd };
    }
  }, [scale, colW]);

  // ── Drag mouse down ────────────────────────────────────────────────────────
  const handleBarMouseDown = (e: React.MouseEvent, task: PlanTask, type: DragInfo['type']) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedId(task.id);
    setDragging({ taskId: task.id, type, startX: e.clientX, origStart: task.start_date, origEnd: task.end_date });
    setPreview({ taskId: task.id, start_date: task.start_date, end_date: task.end_date });
  };

  // ── Live drag effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dates = computeDates(dx, dragging.origStart, dragging.origEnd, dragging.type);
      setPreview({ taskId: dragging.taskId, ...dates });
    };
    const onUp = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dates = computeDates(dx, dragging.origStart, dragging.origEnd, dragging.type);
      onUpdateTask(dragging.taskId, dates);
      setDragging(null);
      setPreview(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, computeDates, onUpdateTask]);

  // ── Keyboard: Delete selected, Escape deselect/cancel edit ────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (editingId || inInput) {
        if (e.key === 'Escape') { setEditingId(null); setEditDraft(''); }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) { onDeleteTask(selectedId); setSelectedId(null); }
      }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, onDeleteTask]);

  // ── Inline edit helpers ────────────────────────────────────────────────────
  const startEdit = (task: PlanTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(task.id);
    setEditDraft(task.name);
    setSelectedId(task.id);
  };

  const commitEdit = (taskId: string) => {
    if (editDraft.trim()) onUpdateTask(taskId, { name: editDraft.trim() });
    setEditingId(null);
    setEditDraft('');
  };

  const headerH = scale === 'weeks' ? 72 : 48;

  if (!hasData) {
    return (
      <div className="flex-1 flex items-center justify-center opacity-40" style={{ fontFamily: SWISS_FONT, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        No tasks yet — add one from the toolbar
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ cursor: dragging ? (dragging.type === 'move' ? 'grabbing' : 'ew-resize') : 'default', userSelect: dragging ? 'none' : 'auto' }}
      onClick={() => { setGroupPickerId(null); setShowNewGroup(false); setSelectedId(null); }}
    >
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left label panel ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-r-2 border-foreground bg-background z-10" style={{ width: LABEL_W }}>
          <div style={{ height: headerH, borderBottom: '2px solid hsl(var(--foreground))' }} />
          {sortedTasks.map((task) => {
            const group = groups.find(g => g.id === task.group_id);
            const isPickerOpen = groupPickerId === task.id;
            const isSelected = selectedId === task.id;
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                style={{
                  height: ROW_H,
                  borderBottom: '1px solid hsl(var(--border))',
                  display: 'flex', alignItems: 'center',
                  padding: '0 8px 0 14px',
                  fontFamily: SWISS_FONT, fontSize: 12, fontWeight: 500,
                  position: 'relative',
                  letterSpacing: '0.01em',
                  background: isSelected ? 'hsl(var(--muted) / 0.5)' : undefined,
                  outline: isSelected ? '2px solid hsl(var(--foreground) / 0.2)' : undefined,
                  outlineOffset: -2,
                }}
                className="transition-colors"
                onClick={e => { e.stopPropagation(); setSelectedId(task.id); setGroupPickerId(null); }}
                onDoubleClick={e => startEdit(task, e)}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onBlur={() => commitEdit(task.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(task.id);
                      if (e.key === 'Escape') { setEditingId(null); setEditDraft(''); }
                      e.stopPropagation();
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      flex: 1, fontFamily: SWISS_FONT, fontSize: 12, fontWeight: 500,
                      background: 'transparent', border: 'none', outline: 'none',
                      borderBottom: '2px solid hsl(var(--foreground) / 0.5)',
                      padding: '0 2px', marginRight: 6, letterSpacing: '0.01em',
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{task.name}</span>
                )}

                {/* Group pill */}
                {!isEditing && (
                  <button
                    onClick={e => { e.stopPropagation(); setGroupPickerId(isPickerOpen ? null : task.id); setShowNewGroup(false); setRenamingGroupId(null); }}
                    title="Assign group"
                    className="flex items-center gap-0.5 text-xs px-2 py-0.5 border transition-colors flex-shrink-0"
                    style={{ fontFamily: SWISS_FONT, fontSize: 10, borderColor: 'hsl(var(--border))', opacity: group ? 0.7 : 0.4, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                  >
                    {group ? group.name.slice(0, 10) : '+ group'}
                    <ChevronDown size={8} />
                  </button>
                )}

                {/* Group picker dropdown */}
                {isPickerOpen && (
                  <div
                    className="absolute z-50 bg-background border-2 border-foreground shadow-xl overflow-hidden"
                    style={{ top: ROW_H, right: 0, minWidth: 190, fontFamily: SWISS_FONT }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button onClick={() => { onUpdateTask(task.id, { group_id: null }); setGroupPickerId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted border-b border-border/50 opacity-60 hover:opacity-100" style={{ letterSpacing: '0.02em' }}>— No Group</button>
                    {groups.map(g => (
                      <div key={g.id} className="flex items-center group border-b border-border/30 last:border-0 hover:bg-muted">
                        {renamingGroupId === g.id ? (
                          <div className="flex items-center gap-1 px-2 py-1 w-full">
                            <input autoFocus value={renameGroupDraft} onChange={e => setRenameGroupDraft(e.target.value)}
                              className="flex-1 text-xs bg-transparent outline-none border-b-2 border-foreground"
                              style={{ fontFamily: SWISS_FONT }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && renameGroupDraft.trim()) { onUpdateGroup?.(g.id, renameGroupDraft.trim()); setRenamingGroupId(null); }
                                if (e.key === 'Escape') setRenamingGroupId(null);
                              }}
                            />
                            <button onClick={() => { if (renameGroupDraft.trim()) { onUpdateGroup?.(g.id, renameGroupDraft.trim()); setRenamingGroupId(null); } }}><Check size={11} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { onUpdateTask(task.id, { group_id: g.id }); setGroupPickerId(null); }} className="flex-1 text-left px-3 py-1.5 text-xs" style={{ fontWeight: task.group_id === g.id ? 700 : 400 }}>
                              {g.name}<span className="opacity-40 ml-1 text-[10px] uppercase tracking-wider">{g.type}</span>
                            </button>
                            <button className="opacity-0 group-hover:opacity-50 hover:!opacity-100 px-1 transition-opacity" onClick={e => { e.stopPropagation(); setRenamingGroupId(g.id); setRenameGroupDraft(g.name); }}><Pencil size={10} /></button>
                            <button className="opacity-0 group-hover:opacity-50 hover:!opacity-100 px-1 text-destructive transition-opacity" onClick={e => { e.stopPropagation(); onDeleteGroup?.(g.id); setGroupPickerId(null); }}><Trash2 size={10} /></button>
                          </>
                        )}
                      </div>
                    ))}
                    {showNewGroup ? (
                      <div className="px-2 py-1.5 flex gap-1 border-t-2 border-foreground">
                        <input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name…"
                          className="flex-1 text-xs border-2 border-foreground px-1 py-0.5 bg-transparent outline-none"
                          style={{ fontFamily: SWISS_FONT }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newGroupName.trim()) { onCreateGroup(newGroupName.trim(), 'client'); setNewGroupName(''); setShowNewGroup(false); setGroupPickerId(null); }
                            if (e.key === 'Escape') { setShowNewGroup(false); setNewGroupName(''); }
                          }}
                        />
                      </div>
                    ) : (
                      <button onClick={() => setShowNewGroup(true)} className="w-full text-left px-3 py-1.5 text-xs border-t-2 border-foreground opacity-60 hover:opacity-100 hover:bg-muted transition-colors uppercase tracking-wider">+ New group…</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right scrollable canvas ───────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative" ref={chartRef}>
          <div style={{ width: totalW, position: 'relative' }}>

            {/* Header */}
            <div style={{ height: headerH, borderBottom: '2px solid hsl(var(--foreground))', position: 'sticky', top: 0, background: 'hsl(var(--background))', zIndex: 5 }}>
              {scale === 'months' && (
                <div style={{ display: 'flex', height: 24, borderBottom: '1px solid hsl(var(--border) / 0.6)', position: 'absolute', top: 0, left: 0, width: totalW }}>
                  {quarterSpans.map((qs, i) => (
                    <div key={i} style={{ width: qs.span * colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid hsl(var(--border) / 0.4)', fontFamily: SWISS_FONT, fontSize: 10, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {qs.label}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', height: scale === 'months' ? 24 : 36, position: 'absolute', top: scale === 'months' ? 24 : 0, left: 0, width: totalW }}>
                {cols.map((col, i) => (
                  <div key={i} style={{ width: colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid hsl(var(--border) / 0.3)', fontFamily: SWISS_FONT, fontSize: scale === 'weeks' ? 10 : 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {scale === 'months' ? MONTHS[col.getMonth()] : `W${weekNumber(col)}`}
                  </div>
                ))}
              </div>
              {scale === 'weeks' && (() => {
                const yearSpans: { label: string; span: number }[] = [];
                let i = 0;
                while (i < cols.length) {
                  const yr = cols[i].getFullYear(); let j = i;
                  while (j < cols.length && cols[j].getFullYear() === yr) j++;
                  yearSpans.push({ label: String(yr), span: j - i }); i = j;
                }
                return (
                  <div style={{ display: 'flex', height: 36, position: 'absolute', top: 36, left: 0, width: totalW }}>
                    {yearSpans.map((ys, idx) => (
                      <div key={idx} style={{ width: ys.span * colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid hsl(var(--border) / 0.3)', fontFamily: SWISS_FONT, fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em' }}>
                        {ys.label}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Grid body */}
            <div style={{ position: 'relative' }}>
              {/* Column dividers */}
              {cols.map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * colW, width: 1, background: 'hsl(var(--foreground) / 0.06)', pointerEvents: 'none' }} />
              ))}

              {/* Today line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: todayX, width: 2, background: 'hsl(0 100% 50%)', opacity: 0.8, zIndex: 4, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', background: 'hsl(0 100% 50%)', color: '#fff', fontSize: 9, fontFamily: SWISS_FONT, fontWeight: 700, padding: '1px 6px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today</div>
              </div>

              {/* Deadline lines */}
              {deadlines.map(dl => {
                const dlX = dateToX(new Date(dl.deadline_date));
                return (
                  <div key={dl.id} style={{ position: 'absolute', top: 0, bottom: 0, left: dlX, width: 0, zIndex: 3, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, background: 'hsl(var(--foreground))', opacity: 0.5, borderLeft: '1px dashed hsl(var(--foreground) / 0.7)' }} />
                    <div
                      style={{
                        position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                        background: 'hsl(var(--foreground))', color: 'hsl(var(--background))',
                        fontSize: 8, fontFamily: SWISS_FONT, fontWeight: 700, padding: '1px 6px',
                        whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.08em',
                        pointerEvents: 'auto', cursor: 'pointer',
                      }}
                      title={`${dl.label} — ${dl.deadline_date}\nClick to delete`}
                      onClick={e => { e.stopPropagation(); onDeleteDeadline?.(dl.id); }}
                    >
                      {dl.label}
                    </div>
                    {/* Diamond marker at bottom */}
                    <div style={{
                      position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                      width: 8, height: 8, background: 'hsl(var(--foreground))', opacity: 0.6, pointerEvents: 'none',
                    }} />
                  </div>
                );
              })}


              {sortedTasks.map((task, rowIdx) => {
                const sc = STATUS_COLORS[task.status as TaskStatus];
                const startDate = preview?.taskId === task.id ? preview.start_date : task.start_date;
                const endDate = preview?.taskId === task.id ? preview.end_date : task.end_date;
                const x = dateToX(new Date(startDate));
                const endX = dateToX(new Date(endDate));
                const w = Math.max(endX - x, colW * 0.5);
                const y = rowIdx * ROW_H;
                const isDragging = dragging?.taskId === task.id;
                const isSelected = selectedId === task.id;
                const isEditing = editingId === task.id;

                return (
                  <div
                    key={task.id}
                    data-task-id={task.id}
                    style={{
                      position: 'absolute',
                      top: y + 6, left: x, width: w, height: ROW_H - 12,
                      background: sc.bar,
                      border: `${isSelected ? 2.5 : 2}px solid ${isSelected ? 'hsl(var(--foreground))' : sc.border}`,
                      borderRadius: 0,
                      cursor: isDragging ? 'grabbing' : (isEditing ? 'text' : 'grab'),
                      display: 'flex', alignItems: 'center',
                      zIndex: isDragging ? 10 : (isSelected ? 4 : 2),
                      overflow: 'visible',
                      boxShadow: isDragging ? '0 4px 16px rgba(0,0,0,0.25)' : isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                      transition: isDragging ? 'none' : 'box-shadow 0.15s',
                    }}
                    onClick={e => { e.stopPropagation(); setSelectedId(task.id); }}
                    onDoubleClick={e => startEdit(task, e)}
                    onMouseDown={e => { if (!isEditing) handleBarMouseDown(e, task, 'move'); }}
                  >
                    {/* Resize LEFT */}
                    <div
                      title="Drag to resize"
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${sc.border}`, background: 'rgba(0,0,0,0.1)' }}
                      onMouseDown={e => { e.stopPropagation(); handleBarMouseDown(e, task, 'resize-left'); }}
                    >
                      <span style={{ width: 2, height: 12, background: sc.text, opacity: 0.5 }} />
                    </div>

                    {/* Inline edit on bar OR label */}
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        onBlur={() => commitEdit(task.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit(task.id);
                          if (e.key === 'Escape') { setEditingId(null); setEditDraft(''); }
                          e.stopPropagation();
                        }}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                        style={{
                          flex: 1, textAlign: 'center', fontFamily: SWISS_FONT, fontSize: 10, fontWeight: 700,
                          color: sc.text, background: 'transparent', border: 'none', outline: 'none',
                          paddingLeft: 14, paddingRight: 14, cursor: 'text',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, textAlign: 'center', fontFamily: SWISS_FONT, fontSize: 10, fontWeight: 700, color: sc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 14, paddingRight: 14, pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {task.is_critical && '★ '}{task.name}
                      </span>
                    )}

                    {/* Resize RIGHT */}
                    <div
                      title="Drag to resize"
                      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `1px solid ${sc.border}`, background: 'rgba(0,0,0,0.1)' }}
                      onMouseDown={e => { e.stopPropagation(); handleBarMouseDown(e, task, 'resize-right'); }}
                    >
                      <span style={{ width: 2, height: 12, background: sc.text, opacity: 0.5 }} />
                    </div>
                  </div>
                );
              })}

              {/* Row backgrounds */}
              {sortedTasks.map((task, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute', top: i * ROW_H, left: 0, right: 0, height: ROW_H,
                    background: selectedId === task.id ? 'hsl(var(--muted) / 0.35)' : i % 2 === 0 ? 'transparent' : 'hsl(var(--muted) / 0.2)',
                    borderBottom: '1px solid hsl(var(--border) / 0.35)',
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* Selection hint */}
              {selectedId && !dragging && !editingId && (
                <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', fontFamily: SWISS_FONT, fontSize: 10, padding: '4px 14px', opacity: 0.7, pointerEvents: 'none', zIndex: 99, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Press Delete to remove · Double-click to rename
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
