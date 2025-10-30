import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  UpdateTaskStatusRequest,
  TasksResponse,
  TaskResponse,
} from "../types/task";

const API_BASE = import.meta.env.DEV ? "/api" : "https://localhost:7001/api";

class TaskService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllTasks(
    assigneeId?: string,
    status?: string
  ): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (assigneeId) params.append("assigneeId", assigneeId);
    if (status) params.append("status", status);

    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : "/tasks";

    return this.request<TasksResponse>(url);
  }

  async getTaskById(id: string): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/tasks/${id}`);
  }

  async createTask(request: CreateTaskRequest): Promise<TaskResponse> {
    return this.request<TaskResponse>("/tasks", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateTask(
    id: string,
    request: UpdateTaskRequest
  ): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async assignTask(taskId: string, assigneeId: string): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/tasks/${taskId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ assigneeId } as AssignTaskRequest),
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: string
  ): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status } as UpdateTaskStatusRequest),
    });
  }
}

export const taskService = new TaskService();
