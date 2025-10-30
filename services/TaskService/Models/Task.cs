using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskService.Models;

[Table("Tasks", Schema = "Tasks")]
public class Task
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "todo"; // todo, inprogress, done, cancelled

    public Guid? AssigneeId { get; set; } // References UserService user

    [Required]
    public Guid CreatedBy { get; set; } // User who created the task

    public int Priority { get; set; } = 3; // 1=High, 2=Medium, 3=Low

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}