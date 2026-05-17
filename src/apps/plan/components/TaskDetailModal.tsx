import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { PlanGroup, PlanTask, TaskStatus } from '../types';
import { STATUS_COLORS } from '../utils';

const SWISS_FONT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

interface Props {
  task: PlanTask;
  groups: PlanGroup[];
  onSave: (updates: Partial<PlanTask>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TaskDetailModal = ({ task, groups, onSave, onDelete, onClose }: Props) => {
  const [name, setName] = useState(task.name);
  const [groupId, setGroupId] = useState<string>(task.group_id ?? '');
  const [startDate, setStartDate] = useState(task.start_date);
  const [endDate, setEndDate] = useState(task.end_date);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isCritical, setIsCritical] = useState(task.is_critical);
  const [color, setColor] = useState<string | null>(task.color ?? null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: SWISS_FONT, fontSize: 13,
    border: '2px solid hsl(var(--foreground) / 0.5)', borderRadius: 0, padding: '8px 12px',
    background: 'transparent', outline: 'none', letterSpacing: '0.01em',
  };
  const labelStyle: React.CSSProperties = { fontFamily: SWISS_FONT, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, display: 'block', opacity: 0.55 };

  const days = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
  const sc = STATUS_COLORS[status];
  const swatches = [
    '#2D6A4F', '#E76F51', '#E9C46A', '#C1121F',
    '#1D3557', '#457B9D', '#6A4C93', '#8338EC',
    '#FB5607', '#FF006E', '#3A86FF', '#06A77D',
    '#222222', '#6B7280',
  ];

  const handleSave = () => {
    if (!name.trim() || !startDate || !endDate) return;
    onSave({
      name: name.trim(),
      group_id: groupId || null,
      start_date: startDate,
      end_date: endDate,
      status,
      is_critical: isCritical,
      color: color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div
        className="bg-background p-7 w-full max-w-lg flex flex-col gap-5"
        style={{ fontFamily: SWISS_FONT, borderRadius: 0, border: '2px solid hsl(var(--foreground))', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span style={{ width: 14, height: 14, background: sc.bar, border: `2px solid ${sc.border}` }} />
            <span style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Edit Task</span>
          </div>
          <button onClick={onClose} className="hover:opacity-50 transition-opacity opacity-40"><X size={16} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span style={labelStyle}>Task Name</span>
            <input autoFocus style={inputStyle} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>
          <div>
            <span style={labelStyle}>Group</span>
            <select style={inputStyle} value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">— No Group —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span style={labelStyle}>Start</span>
              <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <span style={labelStyle}>End</span>
              <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Duration: <strong>{days} day{days !== 1 ? 's' : ''}</strong></span>
          </div>
          <div>
            <span style={labelStyle}>Status</span>
            <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="delayed">Delayed</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer" style={{ fontSize: 12, opacity: 0.7 }}>
            <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} className="w-4 h-4 accent-foreground" />
            Mark as Critical Path
          </label>

          <div>
            <span style={labelStyle}>Color</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setColor(null)}
                title="Use status color"
                style={{
                  width: 28, height: 28, border: `2px solid hsl(var(--foreground) ${color === null ? '' : '/ 0.3'})`,
                  background: 'transparent', position: 'relative', cursor: 'pointer',
                }}
              >
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>AUTO</span>
              </button>
              {swatches.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  style={{
                    width: 28, height: 28, background: c, cursor: 'pointer',
                    border: `2px solid ${color === c ? 'hsl(var(--foreground))' : 'hsl(var(--foreground) / 0.2)'}`,
                    outline: color === c ? '2px solid hsl(var(--foreground))' : 'none',
                    outlineOffset: color === c ? 2 : 0,
                  }}
                />
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer ml-1" style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <input
                  type="color"
                  value={color ?? sc.bar}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: 28, height: 28, padding: 0, border: '2px solid hsl(var(--foreground) / 0.3)', background: 'transparent', cursor: 'pointer' }}
                />
                Custom
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t-2 border-foreground/10">
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="flex items-center gap-1.5 py-2 px-3 hover:bg-destructive/10 transition-colors"
            style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--destructive))', border: '2px solid hsl(var(--destructive) / 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            <Trash2 size={12} /> Delete
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="py-2 px-4" style={{ fontSize: 11, fontWeight: 700, border: '2px solid hsl(var(--foreground) / 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-5 hover:opacity-85 transition-opacity"
            style={{ fontSize: 11, fontWeight: 700, background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', textTransform: 'uppercase', letterSpacing: '0.1em', border: '2px solid hsl(var(--foreground))' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
