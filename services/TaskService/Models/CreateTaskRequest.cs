using System.ComponentModel.DataAnnotations;

namespace TaskService.Models;

public class CreateTaskRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid? AssigneeId { get; set; }

    public int Priority { get; set; } = 3; // 1=High, 2=Medium, 3=Low

    public DateTime? DueDate { get; set; }
}