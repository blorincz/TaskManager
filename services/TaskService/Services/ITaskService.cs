using TaskService.Models;
using Task = TaskService.Models.Task;

namespace TaskService.Services;

public interface ITaskService
{
    Task<List<Task>> GetAllTasksAsync(Guid? assigneeId = null, string? status = null);
    Task<Task?> GetTaskByIdAsync(Guid id);
    Task<Task> CreateTaskAsync(CreateTaskRequest request, Guid createdBy);
    Task<Task?> UpdateTaskAsync(Guid id, UpdateTaskRequest request);
    Task<bool> DeleteTaskAsync(Guid id);
    Task<Task?> AssignTaskAsync(Guid taskId, Guid assigneeId);
    Task<Task?> UpdateTaskStatusAsync(Guid taskId, string status);
}