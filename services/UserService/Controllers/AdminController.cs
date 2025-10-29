using Microsoft.AspNetCore.Mvc;
using UserService.Attributes;
using UserService.Constants;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/[controller]")]
[AuthorizeRole(Roles.Admin)] // Only Admins can access this controller
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IUserService userService, ILogger<AdminController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        var userDtos = users.Select(u => new
        {
            u.Id,
            u.Email,
            u.DisplayName,
            u.Role,
            u.CreatedAt
        });

        _logger.LogInformation("Admin {AdminEmail} retrieved all users", User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value);

        return Ok(new { users = userDtos });
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UpdateRoleRequest request)
    {
        var user = await _userService.UpdateUserRoleAsync(userId, request.Role);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        _logger.LogInformation("Admin {AdminEmail} updated user {UserId} role to {NewRole}",
            User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value, userId, request.Role);

        return Ok(new
        {
            message = "User role updated successfully",
            user = new { user.Id, user.Email, user.Role }
        });
    }

    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        // This demonstrates multiple role authorization
        var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        _logger.LogInformation("Admin {AdminEmail} accessed admin stats", currentUserEmail);

        return Ok(new
        {
            message = "Admin statistics",
            accessedBy = currentUserEmail,
            role = currentUserRole,
            serverTime = DateTime.UtcNow
        });
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = string.Empty;
}