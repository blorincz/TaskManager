export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done" | "cancelled";
  assigneeId?: string;
  createdBy: string;
  priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigneeId?: string;
  priority: 1 | 2 | 3;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: string;
  assigneeId?: string;
  priority: 1 | 2 | 3;
  dueDate?: string;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface UpdateTaskStatusRequest {
  status: string;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}
