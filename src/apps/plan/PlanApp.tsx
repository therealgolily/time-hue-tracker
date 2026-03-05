import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, PanelRightOpen, PanelRightClose, LayoutGrid, Clock, ArrowLeft, Layers, Pencil, Trash2, Check, Flag } from 'lucide-react';
import { usePlanProjects } from './hooks/usePlanProjects';
import { usePlanData } from './hooks/usePlanData';
import { TimeScale, PlanTask, PlanGroup } from './types';
import GanttChart from './components/GanttChart';
import TaskSidebar from './components/TaskSidebar';
import TaskForm from './components/TaskForm';
import SketchyFilter from './components/SketchyFilter';

const SWISS_FONT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Groups management panel (dropdown from toolbar)
const GroupsPanel = ({
  groups,
  onAdd,
  onRename,
  onDelete,
  sketchBtn,
}: {
  groups: PlanGroup[];
  onAdd: (name: string, type: 'client' | 'phase') => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  sketchBtn: (active?: boolean) => React.CSSProperties;
}) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'client' | 'phase'>('client');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const submit = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newType);
    setNewName('');
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} style={sketchBtn(open)} className="flex items-center gap-1.5 border-foreground">
        <Layers size={12} /> Groups
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 z-50 bg-background border-2 border-foreground shadow-lg p-0 overflow-hidden"
          style={{ minWidth: 240, fontFamily: SWISS_FONT }}
          onClick={e => e.stopPropagation()}
        >
          {/* Existing groups */}
          {groups.length > 0 && (
            <div className="border-b-2 border-foreground">
              {groups.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted group">
                  {renamingId === g.id ? (
                    <>
                      <input
                        autoFocus
                        value={renameDraft}
                        onChange={e => setRenameDraft(e.target.value)}
                        className="flex-1 text-sm bg-transparent outline-none border-b-2 border-foreground"
                        style={{ fontFamily: SWISS_FONT }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && renameDraft.trim()) { onRename(g.id, renameDraft.trim()); setRenamingId(null); }
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                      />
                      <button onClick={() => { if (renameDraft.trim()) { onRename(g.id, renameDraft.trim()); setRenamingId(null); } }} className="text-foreground hover:opacity-70">
                        <Check size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-semibold" style={{ letterSpacing: '0.01em' }}>{g.name}</span>
                      <span className="text-xs opacity-40 uppercase tracking-widest">{g.type}</span>
                      <button
                        onClick={() => { setRenamingId(g.id); setRenameDraft(g.name); }}
                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                        title="Rename"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => onDelete(g.id)}
                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive transition-opacity"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Add new group */}
          <div className="p-3 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.12em', opacity: 0.5 }}>New Group</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Group name…"
              className="text-sm border-2 border-foreground px-2 py-1 bg-transparent outline-none focus:ring-1 focus:ring-foreground"
              style={{ fontFamily: SWISS_FONT }}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
            />
            <div className="flex gap-1.5">
              {(['client', 'phase'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className="flex-1 text-xs py-1 border-2 transition-colors capitalize"
                  style={{
                    fontFamily: SWISS_FONT,
                    background: newType === t ? 'var(--foreground)' : 'transparent',
                    color: newType === t ? 'var(--background)' : 'inherit',
                    borderColor: 'currentColor',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={submit}
              className="text-sm font-bold py-1.5 border-2 transition-opacity hover:opacity-80"
              style={{ fontFamily: SWISS_FONT, background: 'var(--foreground)', color: 'var(--background)', borderColor: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11 }}
            >
              + Add Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanApp = () => {
  const { projects, isLoading, createProject, updateProject } = usePlanProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [scale, setScale] = useState<TimeScale>('months');
  const [groupBy] = useState<'client' | 'phase'>('phase');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineLabel, setDeadlineLabel] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  const {
    groups, tasks, dependencies, deadlines,
    createGroup, updateGroup, deleteGroup,
    createTask, updateTask, deleteTask,
    createDependency, deleteDependency,
    createDeadline, updateDeadline, deleteDeadline,
  } = usePlanData(activeProjectId);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) setActiveProjectId(projects[0].id);
  }, [projects, activeProjectId]);

  const handleNewProject = async () => {
    const result = await createProject.mutateAsync('Untitled Project');
    setActiveProjectId(result.id);
    setShowProjectMenu(false);
  };

  const handleTitleSave = () => {
    if (activeProject && titleDraft.trim()) {
      updateProject.mutate({ id: activeProject.id, title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const handleCreateTask = async (t: Parameters<typeof createTask.mutate>[0]) => {
    let gid = t.group_id;
    if (!gid && groups.length === 0) {
      const g = await createGroup.mutateAsync({ name: 'General', type: 'phase' });
      gid = g.id;
    }
    createTask.mutate({ ...t, group_id: gid });
  };

  const sketchBtn = (active?: boolean): React.CSSProperties => ({
    fontFamily: SWISS_FONT, fontSize: 11, fontWeight: 700,
    padding: '4px 12px', border: '2px solid',
    borderColor: 'hsl(var(--foreground) / 0.4)',
    borderRadius: 0,
    background: active ? 'var(--foreground)' : 'transparent',
    color: active ? 'var(--background)' : 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span style={{ fontFamily: SWISS_FONT, fontSize: 14, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading plan…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: SWISS_FONT }}>
      <SketchyFilter />

      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center gap-2.5 px-4 flex-shrink-0" style={{ height: 52 }}>
        <Link to="/apps/work" className="hover:opacity-60 mr-1"><ArrowLeft size={16} /></Link>

        {/* Project selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(v => !v)}
            className="flex items-center gap-1.5 hover:bg-muted px-2 py-1 transition-colors"
            style={{ fontFamily: SWISS_FONT, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                style={{ fontFamily: SWISS_FONT, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', minWidth: 120, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProject?.title ?? 'No Project'}
              </span>
            )}
            <ChevronDown size={13} className="opacity-50" />
          </button>
          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border-2 border-foreground shadow-lg min-w-48 overflow-hidden" style={{ fontFamily: SWISS_FONT }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActiveProjectId(p.id); setShowProjectMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                  style={{ fontSize: 12, letterSpacing: '0.02em' }}
                >
                  {p.title}
                </button>
              ))}
              <button
                onClick={handleNewProject}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2 border-t-2 border-foreground"
                style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                <Plus size={12} /> New Project
              </button>
            </div>
          )}
        </div>

        {activeProject && !editingTitle && (
          <button
            onClick={() => { setEditingTitle(true); setTitleDraft(activeProject.title); }}
            className="opacity-30 hover:opacity-70 transition-opacity"
            title="Rename project"
          >
            <Pencil size={12} />
          </button>
        )}

        <div className="flex-1" />

        {/* Scale toggle */}
        <div className="flex items-center border-2 border-foreground overflow-hidden">
          <button style={sketchBtn(scale === 'months')} onClick={() => setScale('months')} className="flex items-center gap-1 border-0 border-r-2 border-foreground">
            <LayoutGrid size={11} /> Months
          </button>
          <button style={sketchBtn(scale === 'weeks')} onClick={() => setScale('weeks')} className="flex items-center gap-1 border-0">
            <Clock size={11} /> Weeks
          </button>
        </div>

        {/* Groups management */}
        {activeProject && (
          <GroupsPanel
            groups={groups}
            onAdd={(name, type) => createGroup.mutate({ name, type })}
            onRename={(id, name) => updateGroup.mutate({ id, name })}
            onDelete={(id) => deleteGroup.mutate(id)}
            sketchBtn={sketchBtn}
          />
        )}

        {/* Add deadline */}
        <div className="relative">
          <button onClick={() => setShowDeadlineForm(v => !v)} style={sketchBtn(showDeadlineForm)} className="flex items-center gap-1.5 !border-foreground/60">
            <Flag size={12} /> Deadline
          </button>
          {showDeadlineForm && (
            <div
              className="absolute top-full right-0 mt-1 z-50 bg-background border-2 border-foreground shadow-lg p-3 flex flex-col gap-2"
              style={{ minWidth: 220, fontFamily: SWISS_FONT }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.12em', opacity: 0.5 }}>New Deadline</p>
              <input
                value={deadlineLabel}
                onChange={e => setDeadlineLabel(e.target.value)}
                placeholder="Label…"
                className="text-sm border-2 border-foreground px-2 py-1 bg-transparent outline-none"
                style={{ fontFamily: SWISS_FONT }}
              />
              <input
                type="date"
                value={deadlineDate}
                onChange={e => setDeadlineDate(e.target.value)}
                className="text-sm border-2 border-foreground px-2 py-1 bg-transparent outline-none"
                style={{ fontFamily: SWISS_FONT }}
              />
              <button
                onClick={() => {
                  if (deadlineLabel.trim() && deadlineDate) {
                    createDeadline.mutate({ label: deadlineLabel.trim(), deadline_date: deadlineDate });
                    setDeadlineLabel(''); setDeadlineDate(''); setShowDeadlineForm(false);
                  }
                }}
                className="text-sm font-bold py-1.5 border-2 transition-opacity hover:opacity-80"
                style={{ fontFamily: SWISS_FONT, background: 'var(--foreground)', color: 'var(--background)', borderColor: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11 }}
              >
                Add Deadline
              </button>
            </div>
          )}
        </div>

        {/* Add task */}
        <button onClick={() => setShowTaskForm(true)} style={sketchBtn()} className="flex items-center gap-1.5 !border-foreground/60">
          <Plus size={12} /> Task
        </button>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(v => !v)} className="hover:opacity-60 ml-1 transition-opacity">
          {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* Main layout */}
      {!activeProject ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
          <span style={{ fontFamily: SWISS_FONT, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No project selected</span>
          <button onClick={handleNewProject} style={{ ...sketchBtn(), fontSize: 13 }} className="border-foreground">
            + New Project
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <GanttChart
            tasks={tasks}
            groups={groups}
            deadlines={deadlines}
            scale={scale}
            groupBy={groupBy}
            onUpdateTask={(id, updates) => updateTask.mutate({ id, ...(updates as Partial<PlanTask>) })}
            onDeleteTask={(id) => deleteTask.mutate(id)}
            onCreateGroup={(name, type) => createGroup.mutate({ name, type })}
            onUpdateGroup={(id, name) => updateGroup.mutate({ id, name })}
            onDeleteGroup={(id) => deleteGroup.mutate(id)}
            onDeleteDeadline={(id) => deleteDeadline.mutate(id)}
          />
          {sidebarOpen && (
            <TaskSidebar
              tasks={tasks}
              groups={groups}
              onUpdateTask={(id, updates) => updateTask.mutate({ id, ...(updates as Partial<PlanTask>) })}
              onDeleteTask={(id) => deleteTask.mutate(id)}
              onNewTask={() => setShowTaskForm(true)}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>
      )}

      {showTaskForm && (
        <TaskForm
          groups={groups}
          onAdd={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
};

export default PlanApp;
