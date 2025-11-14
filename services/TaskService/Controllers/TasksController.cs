using MessageContracts;
using MessageContracts.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskService.Models;
using TaskService.Services;

namespace TaskService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require authentication
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IRabbitMQService _rabbitMQService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITaskService taskService, IRabbitMQService rabbitMQService ,ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _rabbitMQService = rabbitMQService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] Guid? assigneeId, [FromQuery] string? status)
    {
        try
        {
            var tasks = await _taskService.GetAllTasksAsync(assigneeId, status);
            return Ok(new { tasks });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tasks");
            return StatusCode(500, new { message = "An error occurred while retrieving tasks" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(Guid id)
    {
        try
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }
            return Ok(new { task });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting task {TaskId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the task" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CreateTaskAsync(request, userId);
            if (task != null)
            {
                // Publish TaskCreatedEvent
                var taskCreatedEvent = new TaskCreatedEvent
                {
                    TaskId = task.Id,
                    Title = task.Title,
                    CreatedBy = task.CreatedBy,
                    CreatedAt = DateTime.UtcNow
                };

                _rabbitMQService.PublishMessage(Queues.TaskCreated, taskCreatedEvent);
                _logger.LogInformation("Published TaskCreatedEvent for task {TaskTitle}", request.Title);

                return CreatedAtAction(nameof(GetTask), new { message = "Task created successfully", id = task.Id }, new { task });
            }
            return BadRequest(new { message = "Unable to create task" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, new { message = "An error occurred while creating the task" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            var task = await _taskService.UpdateTaskAsync(id, request);
            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }
            return Ok(new { task });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the task" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        try
        {
            var success = await _taskService.DeleteTaskAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Task not found" });
            }
            return Ok(new { message = "Task deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the task" });
        }
    }

    [HttpPut("{id}/assign")]
    public async Task<IActionResult> AssignTask(Guid id, [FromBody] AssignTaskRequest request)
    {
        try
        {
            var task = await _taskService.AssignTaskAsync(id, request.AssigneeId);
            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }
            // Publish TaskAssignedEvent
            var taskAssignedEvent = new TaskAssignedEvent
            {
                TaskId = id,
                Title = task.Title,
                AssignedTo = request.AssigneeId,
                AssignedAt = DateTime.UtcNow
            };

            _rabbitMQService.PublishMessage(Queues.TaskAssigned, taskAssignedEvent);
            _logger.LogInformation("Published TaskAssignedEvent for task {TaskId}", id);

            return Ok(new { message = "Task assigned successfully", task });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning task {TaskId} to user {AssigneeId}", id, request.AssigneeId);
            return StatusCode(500, new { message = "An error occurred while assigning the task" });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusRequest request)
    {
        try
        {
            var task = await _taskService.UpdateTaskStatusAsync(id, request.Status);
            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }
            return Ok(new { task });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId} status to {Status}", id, request.Status);
            return StatusCode(500, new { message = "An error occurred while updating the task status" });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
        return userId;
    }
}

public class UpdateTaskStatusRequest
{
    public string Status { get; set; } = string.Empty;
}