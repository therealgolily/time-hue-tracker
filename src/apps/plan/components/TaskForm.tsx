import { useState } from 'react';
import { X } from 'lucide-react';
import { PlanGroup, PlanTask, TaskStatus } from '../types';

interface Props {
  groups: PlanGroup[];
  onAdd: (t: { name: string; group_id: string | null; start_date: string; end_date: string; status: TaskStatus; is_critical: boolean }) => void;
  onClose: () => void;
}

const TaskForm = ({ groups, onAdd, onClose }: Props) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [isCritical, setIsCritical] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: "'Caveat', cursive", fontSize: 16,
    border: '1.5px solid hsl(var(--foreground) / 0.5)', borderRadius: 8, padding: '8px 12px',
    background: 'transparent', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontFamily: "'Caveat', cursive", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block', opacity: 0.55 };

  const handleSubmit = () => {
    if (!name.trim() || !startDate || !endDate) return;
    onAdd({ name: name.trim(), group_id: groupId || null, start_date: startDate, end_date: endDate, status, is_critical: isCritical });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div
        className="bg-background p-7 w-full max-w-md flex flex-col gap-5"
        style={{
          fontFamily: "'Caveat', cursive",
          borderRadius: 12,
          border: '1.5px solid hsl(var(--foreground) / 0.18)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 24, fontWeight: 700 }}>New Task</span>
          <button onClick={onClose} className="hover:opacity-50 transition-opacity opacity-40"><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span style={labelStyle}>Task Name</span>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="What needs doing?" className="text-foreground focus:border-foreground/70 transition-colors" />
          </div>
          <div>
            <span style={labelStyle}>Group</span>
            <select style={inputStyle} value={groupId} onChange={e => setGroupId(e.target.value)} className="text-foreground">
              <option value="">— No Group —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span style={labelStyle}>Start</span>
              <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} className="text-foreground" />
            </div>
            <div>
              <span style={labelStyle}>End</span>
              <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} className="text-foreground" />
            </div>
          </div>
          <div>
            <span style={labelStyle}>Status</span>
            <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="text-foreground">
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="delayed">Delayed</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer" style={{ fontFamily: "'Caveat', cursive", fontSize: 15, opacity: 0.7 }}>
            <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} className="w-4 h-4 accent-foreground" />
            Mark as Critical Path
          </label>
          <button
            onClick={handleSubmit}
            className="mt-1 py-2.5 rounded-lg font-bold hover:opacity-85 transition-opacity"
            style={{ fontFamily: "'Caveat', cursive", fontSize: 17, fontWeight: 700, background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
