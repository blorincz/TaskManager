// src/components/TaskCard.tsx
import { useState } from "react";
import type { Task, UpdateTaskRequest } from "../types/task";
import { useAuth } from "../hooks/useAuth";

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: UpdateTaskRequest) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);

    const updateRequest: UpdateTaskRequest = {
      title: task.title,
      description: task.description || "",
      status: newStatus,
      assigneeId: task.assigneeId,
      priority: task.priority,
      dueDate: task.dueDate,
    };

    await onUpdate(task.id, updateRequest);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      await onDelete(task.id);
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "priority-high";
      case 2:
        return "priority-medium";
      case 3:
        return "priority-low";
      default:
        return "priority-low";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`task-card task-status-${task.status} ${getPriorityColor(task.priority)}`}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className="status-select"
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="delete-button"
            title="Delete task"
          >
            {isDeleting ? "..." : "×"}
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-priority">
          <span
            className={`priority-dot ${getPriorityColor(task.priority)}`}
          ></span>
          {task.priority === 1
            ? "High"
            : task.priority === 2
              ? "Medium"
              : "Low"}{" "}
          Priority
        </div>

        {task.dueDate && (
          <div className={`task-due-date ${isOverdue ? "overdue" : ""}`}>
            📅 {formatDate(task.dueDate)} {isOverdue && "⚠️"}
          </div>
        )}

        <div className="task-created">
          Created: {formatDate(task.createdAt)}
        </div>
      </div>

      {task.assigneeId && (
        <div className="task-assignee">
          👤 Assigned to:{" "}
          {task.assigneeId === user?.id
            ? "You"
            : "User " + task.assigneeId.slice(0, 8)}
        </div>
      )}
    </div>
  );
};
