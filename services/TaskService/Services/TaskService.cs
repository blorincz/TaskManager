using Microsoft.EntityFrameworkCore;
using TaskService.Data;
using TaskService.Models;
using Task = TaskService.Models.Task;

namespace TaskService.Services;

public class TaskService : ITaskService
{
    private readonly TaskDbContext _context;
    private readonly ILogger<TaskService> _logger;

    public TaskService(TaskDbContext context, ILogger<TaskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Task>> GetAllTasksAsync(Guid? assigneeId = null, string? status = null)
    {
        var query = _context.Tasks.AsQueryable();

        if (assigneeId.HasValue)
        {
            query = query.Where(t => t.AssigneeId == assigneeId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Task?> GetTaskByIdAsync(Guid id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<Task> CreateTaskAsync(CreateTaskRequest request, Guid createdBy)
    {
        var task = new Task
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = "todo",
            AssigneeId = request.AssigneeId,
            CreatedBy = createdBy,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Task created: {TaskId} by user {UserId}", task.Id, createdBy);
        return task;
    }

    public async Task<Task?> UpdateTaskAsync(Guid id, UpdateTaskRequest request)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return null;
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.AssigneeId = request.AssigneeId;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Task updated: {TaskId}", task.Id);
        return task;
    }

    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Task deleted: {TaskId}", task.Id);
        return true;
    }

    public async Task<Task?> AssignTaskAsync(Guid taskId, Guid assigneeId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
        {
            return null;
        }

        task.AssigneeId = assigneeId;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Task {TaskId} assigned to user {AssigneeId}", taskId, assigneeId);
        return task;
    }

    public async Task<Task?> UpdateTaskStatusAsync(Guid taskId, string status)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
        {
            return null;
        }

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Task {TaskId} status updated to {Status}", taskId, status);
        return task;
    }
}