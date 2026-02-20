import { useRef, useState, useCallback, useEffect } from 'react';
import {
  PlanTask, PlanGroup, PlanDependency, TimeScale, TaskStatus,
} from '../types';
import {
  STATUS_COLORS, daysDiff, weekStart, addWeeks, monthStart, addMonths,
  weekNumber, quarterOf, toISO,
} from '../utils';

const ROW_H = 38;
const LABEL_W = 180;
const COL_W_WEEK = 28;
const COL_W_MONTH = 80;

interface Props {
  tasks: PlanTask[];
  groups: PlanGroup[];
  dependencies: PlanDependency[];
  scale: TimeScale;
  groupBy: 'client' | 'phase';
  onUpdateTask: (id: string, updates: Partial<PlanTask>) => void;
  onCreateDep: (from: string, to: string) => void;
  onDeleteDep: (id: string) => void;
}

// Build the column grid
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
    while (cur <= end) {
      cols.push(new Date(cur));
      cur = addWeeks(cur, 1);
    }
    return { cols, start, colW: COL_W_WEEK };
  } else {
    const start = monthStart(new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1));
    const end = monthStart(new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 1));
    const cols: Date[] = [];
    let cur = new Date(start);
    while (cur <= end) {
      cols.push(new Date(cur));
      cur = addMonths(cur, 1);
    }
    return { cols, start, colW: COL_W_MONTH };
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const GanttChart = ({
  tasks, groups, dependencies, scale, onUpdateTask, onCreateDep, onDeleteDep,
}: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ taskId: string; type: 'move' | 'resize-left' | 'resize-right'; startX: number; origStart: string; origEnd: string } | null>(null);
  const [depDrag, setDepDrag] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const [hoveredDep, setHoveredDep] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const hasData = tasks.length > 0;
  const { cols, start, colW } = hasData ? buildColumns(scale, tasks) : { cols: [] as Date[], start: new Date(), colW: COL_W_MONTH };
  const today = new Date();

  // pixel offset for a date
  const dateToX = useCallback((date: Date): number => {
    const totalDays = daysDiff(start, date);
    if (scale === 'weeks') return (totalDays / 7) * colW;
    const mIdx = cols.findIndex(c => c.getFullYear() === date.getFullYear() && c.getMonth() === date.getMonth());
    if (mIdx === -1) return cols.length * colW;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return mIdx * colW + (date.getDate() / daysInMonth) * colW;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, scale, colW, cols]);

  // Build header rows
  // Quarter spans (months scale)
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

  // Sort tasks by group order then row_order
  const sortedTasks = [...tasks].sort((a, b) => {
    const ga = groups.findIndex(g => g.id === a.group_id);
    const gb = groups.findIndex(g => g.id === b.group_id);
    if (ga !== gb) return ga - gb;
    return a.row_order - b.row_order;
  });

  const taskRowIndex = (id: string) => sortedTasks.findIndex(t => t.id === id);

  // Mouse handlers for drag-move/resize
  const handleBarMouseDown = (e: React.MouseEvent, task: PlanTask, type: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ taskId: task.id, type, startX: e.clientX, origStart: task.start_date, origEnd: task.end_date });
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const origS = new Date(dragging.origStart);
      const origE = new Date(dragging.origEnd);
      if (scale === 'weeks') {
        const weeks = Math.round(dx / colW);
        if (dragging.type === 'move') {
          const ns = addWeeks(origS, weeks);
          const ne = addWeeks(origE, weeks);
          onUpdateTask(dragging.taskId, { start_date: toISO(ns), end_date: toISO(ne) });
        } else if (dragging.type === 'resize-right') {
          const ne = addWeeks(origE, weeks);
          if (ne > origS) onUpdateTask(dragging.taskId, { end_date: toISO(ne) });
        } else {
          const ns = addWeeks(origS, weeks);
          if (ns < origE) onUpdateTask(dragging.taskId, { start_date: toISO(ns) });
        }
      } else {
        const months = Math.round(dx / colW);
        if (dragging.type === 'move') {
          const ns = addMonths(origS, months);
          const ne = addMonths(origE, months);
          onUpdateTask(dragging.taskId, { start_date: toISO(ns), end_date: toISO(ne) });
        } else if (dragging.type === 'resize-right') {
          const ne = addMonths(origE, months);
          if (ne > origS) onUpdateTask(dragging.taskId, { end_date: toISO(ne) });
        } else {
          const ns = addMonths(origS, months);
          if (ns < origE) onUpdateTask(dragging.taskId, { start_date: toISO(ns) });
        }
      }
    };
    const handleMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [dragging, scale, colW, onUpdateTask]);

  // Dependency drag
  const handleDepStart = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault(); e.stopPropagation();
    const rect = chartRef.current!.getBoundingClientRect();
    setDepDrag({ fromId: taskId, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!depDrag) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = chartRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDepDrag(d => d ? { ...d, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
    };
    const handleMouseUp = (e: MouseEvent) => {
      // find which task we dropped on
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const toId = el?.closest('[data-task-id]')?.getAttribute('data-task-id');
      if (toId && toId !== depDrag.fromId) {
        onCreateDep(depDrag.fromId, toId);
      }
      setDepDrag(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [depDrag, onCreateDep]);

  const headerH = scale === 'weeks' ? 72 : 48;

  if (!hasData) {
    return (
      <div className="flex-1 flex items-center justify-center opacity-40" style={{ fontFamily: "'Caveat', cursive", fontSize: 20 }}>
        No tasks yet — add one from the sidebar
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left label panel */}
        <div className="flex-shrink-0 border-r-2 border-foreground bg-background z-10" style={{ width: LABEL_W }}>
          {/* Header spacer */}
          <div style={{ height: headerH, borderBottom: '2px solid currentColor' }} className="border-foreground" />
          {/* Group + task rows */}
          {sortedTasks.map((task) => {
            const group = groups.find(g => g.id === task.group_id);
            return (
              <div
                key={task.id}
                style={{ height: ROW_H, borderBottom: '1px solid', display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: "'Caveat', cursive", fontSize: 13, fontWeight: 600 }}
                className="border-foreground/20"
              >
                {group && (
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45, marginRight: 6 }}>{group.name.slice(0, 3)}</span>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right scrollable canvas */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative" ref={chartRef}>
          <div style={{ width: totalW, position: 'relative' }}>
            {/* Header */}
            <div style={{ height: headerH, borderBottom: '2px solid', position: 'sticky', top: 0, background: 'var(--background)', zIndex: 5 }} className="border-foreground">
              {/* Quarter row (months view only) */}
              {scale === 'months' && (
                <div style={{ display: 'flex', height: 24, borderBottom: '1px solid', position: 'absolute', top: 0, left: 0, width: totalW }} className="border-foreground/30">
                  {quarterSpans.map((qs, i) => (
                    <div key={i} style={{ width: qs.span * colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid', fontFamily: "'Caveat', cursive", fontSize: 12, fontWeight: 700, filter: 'url(#sketchy)' }} className="border-foreground/20">
                      {qs.label}
                    </div>
                  ))}
                </div>
              )}
              {/* Month / Week row */}
              <div style={{ display: 'flex', height: scale === 'months' ? 24 : (scale === 'weeks' ? 36 : 24), position: 'absolute', top: scale === 'months' ? 24 : 0, left: 0, width: totalW }} className="">
                {cols.map((col, i) => (
                  <div key={i} style={{ width: colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px dashed', fontFamily: "'Caveat', cursive", fontSize: scale === 'weeks' ? 11 : 13, fontWeight: 600, filter: 'url(#sketchy)' }} className="border-foreground/25">
                    {scale === 'months' ? MONTHS[col.getMonth()] : `W${weekNumber(col)}`}
                  </div>
                ))}
              </div>
              {/* Year row (weeks view) */}
              {scale === 'weeks' && (() => {
                const yearSpans: { label: string; startCol: number; span: number }[] = [];
                let i = 0;
                while (i < cols.length) {
                  const yr = cols[i].getFullYear();
                  let j = i;
                  while (j < cols.length && cols[j].getFullYear() === yr) j++;
                  yearSpans.push({ label: String(yr), startCol: i, span: j - i });
                  i = j;
                }
                return (
                  <div style={{ display: 'flex', height: 36, position: 'absolute', top: 36, left: 0, width: totalW }}>
                    {yearSpans.map((ys, idx) => (
                      <div key={idx} style={{ width: ys.span * colW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid', fontFamily: "'Caveat', cursive", fontSize: 12, fontWeight: 700 }} className="border-foreground/25">
                        {ys.label}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Grid body */}
            <div style={{ position: 'relative' }}>
              {/* Vertical dashed column dividers */}
              {cols.map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * colW, width: 1, borderLeft: '1px dashed', opacity: 0.2, pointerEvents: 'none' }} className="border-foreground" />
              ))}

              {/* Today line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: todayX, width: 2, borderLeft: '2px dashed #C1121F', zIndex: 4, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', bottom: -20, left: -18, background: '#C1121F', color: '#fff', fontSize: 10, fontFamily: "'Caveat', cursive", fontWeight: 700, padding: '1px 6px', borderRadius: 10, whiteSpace: 'nowrap' }}>Today</div>
              </div>

              {/* SVG for dependency arrows */}
              <svg style={{ position: 'absolute', inset: 0, width: totalW, height: sortedTasks.length * ROW_H, pointerEvents: 'none', zIndex: 3 }}>
                {dependencies.map(dep => {
                  const fromIdx = taskRowIndex(dep.from_task_id);
                  const toIdx = taskRowIndex(dep.to_task_id);
                  const fromTask = tasks.find(t => t.id === dep.from_task_id);
                  const toTask = tasks.find(t => t.id === dep.to_task_id);
                  if (!fromTask || !toTask || fromIdx === -1 || toIdx === -1) return null;
                  const x1 = dateToX(new Date(fromTask.end_date));
                  const y1 = fromIdx * ROW_H + ROW_H / 2;
                  const x2 = dateToX(new Date(toTask.start_date));
                  const y2 = toIdx * ROW_H + ROW_H / 2;
                  const mx = (x1 + x2) / 2;
                  const isHovered = hoveredDep === dep.id;
                  return (
                    <g key={dep.id} style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredDep(dep.id)}
                      onMouseLeave={() => setHoveredDep(null)}
                      onClick={() => onDeleteDep(dep.id)}
                    >
                      <path
                        d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                        fill="none"
                        stroke={isHovered ? '#C1121F' : 'currentColor'}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        strokeDasharray={isHovered ? undefined : '5,3'}
                        opacity={isHovered ? 1 : 0.5}
                        filter="url(#sketchy)"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
                {/* Live dep drag line */}
                {depDrag && (() => {
                  const fromIdx = taskRowIndex(depDrag.fromId);
                  const fromTask = tasks.find(t => t.id === depDrag.fromId);
                  if (!fromTask || fromIdx === -1) return null;
                  const x1 = dateToX(new Date(fromTask.end_date));
                  const y1 = fromIdx * ROW_H + ROW_H / 2;
                  return <line x1={x1} y1={y1} x2={depDrag.x} y2={depDrag.y} stroke="currentColor" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.6} />;
                })()}
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>
              </svg>

              {/* Task bars */}
              {sortedTasks.map((task, rowIdx) => {
                const sc = STATUS_COLORS[task.status as TaskStatus];
                const x = dateToX(new Date(task.start_date));
                const endX = dateToX(new Date(task.end_date));
                const w = Math.max(endX - x, colW * 0.5);
                const y = rowIdx * ROW_H;
                const isHov = hoveredTask === task.id;
                return (
                  <div
                    key={task.id}
                    data-task-id={task.id}
                    style={{ position: 'absolute', top: y + 5, left: x, width: w, height: ROW_H - 10, background: sc.bar, border: `2px solid ${sc.border}`, borderRadius: 0, cursor: 'grab', display: 'flex', alignItems: 'center', filter: 'url(#sketchy)', zIndex: 2, overflow: 'hidden' }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onMouseDown={e => handleBarMouseDown(e, task, 'move')}
                  >
                    {/* Resize left handle */}
                    <div
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize', background: 'rgba(0,0,0,0.2)' }}
                      onMouseDown={e => handleBarMouseDown(e, task, 'resize-left')}
                    />
                    {/* Label */}
                    <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Caveat', cursive", fontSize: 12, fontWeight: 700, color: sc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 10, paddingRight: 10, pointerEvents: 'none', userSelect: 'none' }}>
                      {task.is_critical && '★ '}{task.name}
                    </span>
                    {/* Resize right handle */}
                    <div
                      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize', background: 'rgba(0,0,0,0.2)' }}
                      onMouseDown={e => handleBarMouseDown(e, task, 'resize-right')}
                    />
                    {/* Dep handle (on hover) */}
                    {isHov && (
                      <div
                        style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, background: '#fff', border: `2px solid ${sc.border}`, borderRadius: '50%', cursor: 'crosshair', zIndex: 5 }}
                        onMouseDown={e => handleDepStart(e, task.id)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Row backgrounds */}
              {sortedTasks.map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * ROW_H, left: 0, right: 0, height: ROW_H, background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.025)', borderBottom: '1px solid', pointerEvents: 'none' }} className="border-foreground/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
