import type { Task, UpdateTaskRequest } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: UpdateTaskRequest) => Promise<boolean>;
  onTaskDelete: (id: string) => Promise<boolean>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const columns = [
    { key: "todo", title: "To Do", color: "#e2e8f0" },
    { key: "inprogress", title: "In Progress", color: "#fed7aa" },
    { key: "done", title: "Done", color: "#bbf7d0" },
    { key: "cancelled", title: "Cancelled", color: "#fecaca" },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="task-board">
      {columns.map((column) => (
        <div key={column.key} className="task-column">
          <div
            className="column-header"
            style={{ backgroundColor: column.color }}
          >
            <h3>{column.title}</h3>
            <span className="task-count">
              {getTasksByStatus(column.key).length}
            </span>
          </div>
          <div className="column-content">
            {getTasksByStatus(column.key).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            ))}
            {getTasksByStatus(column.key).length === 0 && (
              <div className="empty-column">No tasks</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
