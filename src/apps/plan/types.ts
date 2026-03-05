export type TaskStatus = 'pending' | 'done' | 'delayed' | 'critical';
export type GroupType = 'client' | 'phase';
export type TimeScale = 'weeks' | 'months';
export type GroupBy = 'client' | 'phase';

export interface PlanProject {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface PlanGroup {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  type: GroupType;
  order: number;
  created_at: string;
}

export interface PlanTask {
  id: string;
  project_id: string;
  group_id: string | null;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
  is_critical: boolean;
  row_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanDependency {
  id: string;
  from_task_id: string;
  to_task_id: string;
  user_id: string;
  created_at: string;
}

export interface PlanDeadline {
  id: string;
  project_id: string;
  user_id: string;
  label: string;
  deadline_date: string;
  created_at: string;
}
