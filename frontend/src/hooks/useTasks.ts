// src/hooks/useTasks.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "../types/task";
import { taskService } from "../services/taskService";

interface TaskFilter {
  assigneeId?: string | "unassigned";
  status?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({});

  // Use ref to track initial mount and prevent double fetch
  const hasFetched = useRef(false);

  const fetchTasks = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous requests
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      // Only pass GUID assigneeId to the API, handle "unassigned" client-side
      const apiAssigneeId =
        filter.assigneeId === "unassigned" ? undefined : filter.assigneeId;
      const response = await taskService.getAllTasks(
        apiAssigneeId as string | undefined,
        filter.status
      );
      setTasks(response.tasks);
      hasFetched.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [filter.assigneeId, filter.status, loading]);

  // Apply client-side filtering for "unassigned"
  useEffect(() => {
    let result = tasks;

    if (filter.assigneeId === "unassigned") {
      result = result.filter((task) => !task.assigneeId);
    }

    setFilteredTasks(result);
  }, [tasks, filter.assigneeId]);

  // Fetch tasks only when filter changes, not on every render
  useEffect(() => {
    // Only fetch if we haven't already fetched or if filters changed
    if (!hasFetched.current || Object.keys(filter).length > 0) {
      fetchTasks();
    }
  }, [fetchTasks, filter]); // Only depend on filter changes

  const createTask = async (request: CreateTaskRequest): Promise<boolean> => {
    try {
      const response = await taskService.createTask(request);
      setTasks((prev) => [response.task, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      return false;
    }
  };

  const updateTask = async (
    id: string,
    request: UpdateTaskRequest
  ): Promise<boolean> => {
    try {
      const response = await taskService.updateTask(id, request);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.task : task))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      return false;
    }
  };

  const assignTask = async (
    taskId: string,
    assigneeId: string
  ): Promise<boolean> => {
    try {
      const response = await taskService.assignTask(taskId, assigneeId);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.task : task))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign task");
      return false;
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    status: string
  ): Promise<boolean> => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.task : task))
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task status"
      );
      return false;
    }
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    error,
    filter,
    setFilter,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
  };
};
