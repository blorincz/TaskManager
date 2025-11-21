// src/components/TaskDashboard.tsx
import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";
import { TaskBoard } from "./TaskBoard";
import { CreateTaskForm } from "./CreateTaskForm";
import type { CreateTaskRequest, UpdateTaskRequest } from "../types/task";

export const TaskDashboard = () => {
  const {
    tasks,
    allTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    filter,
    setFilter,
  } = useTasks();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateTask = async (
    taskData: CreateTaskRequest
  ): Promise<boolean> => {
    const success = await createTask(taskData);
    if (success) {
      setShowCreateForm(false);
    }
    return success;
  };

  const handleUpdateTask = async (
    id: string,
    updates: UpdateTaskRequest
  ): Promise<boolean> => {
    return await updateTask(id, updates);
  };

  const handleDeleteTask = async (id: string): Promise<boolean> => {
    return await deleteTask(id);
  };

  const handleAssigneeFilterChange = (value: string) => {
    if (value === "me" && user) {
      setFilter((prev) => ({ ...prev, assigneeId: user.id }));
    } else if (value === "unassigned") {
      setFilter((prev) => ({ ...prev, assigneeId: "unassigned" }));
    } else {
      setFilter((prev) => ({ ...prev, assigneeId: undefined }));
    }
  };

  const getAssigneeFilterValue = () => {
    if (filter.assigneeId === "unassigned") return "unassigned";
    if (filter.assigneeId === user?.id) return "me";
    return "";
  };

  if (loading && tasks.length === 0) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-dashboard">
      <div className="dashboard-header">
        <h1>Task Management</h1>
        <div className="dashboard-actions">
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-task-button"
          >
            + New Task
          </button>
        </div>
      </div>
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}
      <div className="filters">
        <select
          value={filter.status || ""}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              status: e.target.value || undefined,
            }))
          }
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={getAssigneeFilterValue()}
          onChange={(e) => handleAssigneeFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Assignees</option>
          <option value="me">Assigned to Me</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>
      {showCreateForm ? (
        <CreateTaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
        />
      )}
      <div className="dashboard-stats">
        <div className="stat">
          <span className="stat-number">
            {allTasks.filter((t) => t.status === "todo").length}
          </span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {allTasks.filter((t) => t.status === "inprogress").length}
          </span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {allTasks.filter((t) => t.status === "done").length}
          </span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat">
          <span className="stat-number">{allTasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
    </div>
  );
};
