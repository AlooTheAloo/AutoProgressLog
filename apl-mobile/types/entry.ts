export interface entry {
  id: number;
  workspace_id: number;
  project_id: number | null;
  task_id: number | null;
  billable: boolean;
  start: string;
  stop: string;
  duration: number;
  description: string;
  tags: any[];
  tag_ids: any[];
  duronly: boolean;
  at: string;
  server_deleted_at: null;
  user_id: number;
  uid: number;
  wid: number;
  permissions: null;
}
