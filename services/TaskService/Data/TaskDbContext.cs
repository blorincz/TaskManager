using Microsoft.EntityFrameworkCore;
using Task = TaskService.Models.Task;

namespace TaskService.Data;

public class TaskDbContext : DbContext
{
    public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options)
    {
    }

    public DbSet<Task> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Task entity
        modelBuilder.Entity<Task>(entity =>
        {
            entity.ToTable("Tasks", "Tasks");
            entity.HasKey(t => t.Id);

            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => t.AssigneeId);
            entity.HasIndex(t => t.CreatedBy);
            entity.HasIndex(t => t.DueDate);

            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Status).IsRequired().HasMaxLength(50);
            entity.Property(t => t.Priority).HasDefaultValue(3);
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(t => t.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        base.OnModelCreating(modelBuilder);
    }
}