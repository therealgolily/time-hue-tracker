import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, PanelRightOpen, PanelRightClose, LayoutGrid, Clock, ArrowLeft, Layers } from 'lucide-react';
import { usePlanProjects } from './hooks/usePlanProjects';
import { usePlanData } from './hooks/usePlanData';
import { TimeScale, PlanTask } from './types';
import GanttChart from './components/GanttChart';
import TaskSidebar from './components/TaskSidebar';
import TaskForm from './components/TaskForm';
import SketchyFilter from './components/SketchyFilter';

// Small inline component for adding a group from the toolbar
const GroupButton = ({ onAdd, sketchBtn }: { onAdd: (name: string, type: 'client' | 'phase') => void; sketchBtn: (active?: boolean) => React.CSSProperties }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'client' | 'phase'>('client');
  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), type);
    setName(''); setOpen(false);
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} style={sketchBtn(open)} className="flex items-center gap-1 border-foreground">
        <Layers size={12} /> Group
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 z-50 bg-background border-2 border-foreground p-3 flex flex-col gap-2"
          style={{ minWidth: 200, filter: 'url(#sketchy)', fontFamily: "'Caveat', cursive" }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Group</span>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Group name…"
            style={{ fontSize: 14, fontFamily: "'Caveat', cursive", border: '1.5px solid currentColor', padding: '4px 8px', background: 'transparent', outline: 'none' }}
            className="text-foreground"
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
          />
          <div className="flex gap-2">
            {(['client', 'phase'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{ fontSize: 12, padding: '2px 8px', border: '1.5px solid currentColor', fontFamily: "'Caveat', cursive", background: type === t ? 'var(--foreground)' : 'transparent', color: type === t ? 'var(--background)' : 'inherit', cursor: 'pointer', flex: 1 }}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Caveat', cursive", border: '2px solid currentColor', padding: '4px', background: 'var(--foreground)', color: 'var(--background)', cursor: 'pointer' }}
          >
            + Add Group
          </button>
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
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  const {
    groups, tasks, dependencies,
    createGroup, createTask, updateTask, deleteTask,
    createDependency, deleteDependency,
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
    // Ensure at least one group exists
    let gid = t.group_id;
    if (!gid && groups.length === 0) {
      const g = await createGroup.mutateAsync({ name: 'General', type: 'phase' });
      gid = g.id;
    }
    createTask.mutate({ ...t, group_id: gid });
  };

  const toolbar: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 16px', height: 48, borderBottom: '2px solid',
    flexShrink: 0, fontFamily: "'Caveat', cursive",
  };

  const sketchBtn = (active?: boolean): React.CSSProperties => ({
    fontFamily: "'Caveat', cursive", fontSize: 14, fontWeight: 700,
    padding: '3px 12px', border: '2px solid currentColor',
    background: active ? 'var(--foreground)' : 'transparent',
    color: active ? 'var(--background)' : 'inherit',
    cursor: 'pointer', filter: 'url(#sketchy)',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, opacity: 0.5 }}>Loading plan…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <SketchyFilter />

      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center" style={toolbar}>
        <Link to="/apps/work" className="hover:opacity-60 mr-2"><ArrowLeft size={16} /></Link>

        {/* Project selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(v => !v)}
            style={{ ...sketchBtn(), display: 'flex', alignItems: 'center', gap: 6 }}
            className="border-foreground"
          >
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                style={{ fontFamily: "'Caveat', cursive", fontSize: 15, border: 'none', outline: 'none', background: 'transparent', minWidth: 120 }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{ fontSize: 15, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProject?.title ?? 'No Project'}
              </span>
            )}
            <ChevronDown size={12} />
          </button>
          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border-2 border-foreground min-w-48" style={{ filter: 'url(#sketchy)', fontFamily: "'Caveat', cursive" }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActiveProjectId(p.id); setShowProjectMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                  style={{ fontSize: 14, borderBottom: '1px solid', fontFamily: "'Caveat', cursive" }}
                >
                  {p.title}
                </button>
              ))}
              <button
                onClick={handleNewProject}
                className="w-full text-left px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center gap-2"
                style={{ fontSize: 14, fontFamily: "'Caveat', cursive" }}
              >
                <Plus size={12} /> New Project
              </button>
            </div>
          )}
        </div>

        {activeProject && (
          <button onClick={() => { setEditingTitle(true); setTitleDraft(activeProject.title); }} style={{ fontSize: 11, opacity: 0.4, fontFamily: "'Caveat', cursive" }} className="hover:opacity-80">
            rename
          </button>
        )}

        <div className="flex-1" />

        {/* Scale toggle */}
        <div className="flex items-center gap-1 border-2 border-foreground" style={{ filter: 'url(#sketchy)' }}>
          <button style={sketchBtn(scale === 'months')} onClick={() => setScale('months')} className="flex items-center gap-1 border-0">
            <LayoutGrid size={12} /> Months
          </button>
          <button style={sketchBtn(scale === 'weeks')} onClick={() => setScale('weeks')} className="flex items-center gap-1 border-0">
            <Clock size={12} /> Weeks
          </button>
        </div>

        {/* Add group */}
        {activeProject && (
          <GroupButton onAdd={(name, type) => createGroup.mutate({ name, type })} sketchBtn={sketchBtn} />
        )}

        {/* Add task */}
        <button onClick={() => setShowTaskForm(true)} style={sketchBtn()} className="flex items-center gap-1 border-foreground">
          <Plus size={12} /> Task
        </button>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(v => !v)} className="hover:opacity-60 ml-1">
          {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* Main layout */}
      {!activeProject ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 22 }}>No project selected</span>
          <button onClick={handleNewProject} style={{ ...sketchBtn(), fontSize: 16 }} className="border-foreground">
            + New Project
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <GanttChart
            tasks={tasks}
            groups={groups}
            dependencies={dependencies}
            scale={scale}
            groupBy={groupBy}
            onUpdateTask={(id, updates) => updateTask.mutate({ id, ...(updates as Partial<PlanTask>) })}
            onCreateDep={(from, to) => createDependency.mutate({ from_task_id: from, to_task_id: to })}
            onDeleteDep={(id) => deleteDependency.mutate(id)}
            onCreateGroup={(name, type) => createGroup.mutate({ name, type })}
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
