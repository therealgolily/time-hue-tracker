import { useState } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { PlanTask, PlanGroup, TaskStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../utils';

const SWISS_FONT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

interface Props {
  tasks: PlanTask[];
  groups: PlanGroup[];
  onUpdateTask: (id: string, updates: Partial<PlanTask>) => void;
  onDeleteTask: (id: string) => void;
  onNewTask: () => void;
  onClose: () => void;
}

const TaskSidebar = ({ tasks, groups, onUpdateTask, onDeleteTask, onNewTask, onClose }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupName = (id: string | null) => groups.find(g => g.id === id)?.name ?? '—';

  return (
    <div
      className="flex flex-col h-full border-l-2 border-foreground bg-background"
      style={{ width: 280, fontFamily: SWISS_FONT }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground flex-shrink-0">
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tasks ({tasks.length})</span>
        <div className="flex gap-2">
          <button onClick={onNewTask} className="hover:opacity-60" title="New task"><Plus size={15} /></button>
          <button onClick={onClose} className="hover:opacity-60"><X size={15} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="p-6 text-center opacity-50" style={{ fontSize: 12 }}>No tasks yet.<br />Add one above.</div>
        )}
        {tasks.map(task => {
          const sc = STATUS_COLORS[task.status as TaskStatus];
          const isOpen = expandedId === task.id;
          return (
            <div key={task.id} className="border-b border-foreground/20">
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-foreground/5"
                onClick={() => setExpandedId(isOpen ? null : task.id)}
              >
                <div style={{ width: 10, height: 10, background: sc.bar, border: `2px solid ${sc.border}`, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{task.name}</span>
                <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, opacity: 0.5 }} />
              </div>
              {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-2">
                  <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.02em' }}>
                    {groupName(task.group_id)} · {task.start_date} → {task.end_date}
                    {task.is_critical && <span style={{ marginLeft: 6, color: STATUS_COLORS.critical.bar, fontWeight: 700 }}>★ Critical</span>}
                  </div>
                  <select
                    value={task.status}
                    onChange={e => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                    style={{ fontSize: 11, fontFamily: SWISS_FONT, border: '2px solid currentColor', padding: '2px 6px', background: sc.bar, color: sc.text, width: '100%' }}
                  >
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    style={{ fontSize: 11, textAlign: 'left', opacity: 0.5, fontFamily: SWISS_FONT, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    className="hover:opacity-100 hover:text-red-600"
                  >
                    Delete task
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="border-t-2 border-foreground px-3 py-3 flex-shrink-0">
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, opacity: 0.5 }}>Legend</div>
        <div className="flex flex-col gap-1">
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div style={{ width: 14, height: 10, background: STATUS_COLORS[s].bar, border: `2px solid ${STATUS_COLORS[s].border}` }} />
              <span style={{ fontSize: 11, letterSpacing: '0.02em' }}>{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskSidebar;
