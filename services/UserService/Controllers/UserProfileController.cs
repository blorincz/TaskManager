using Microsoft.AspNetCore.Mvc;
using UserService.Attributes;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints in this controller require authentication
public class UserProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public UserProfileController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        return Ok(new
        {
            userId,
            email = userEmail,
            displayName = userName,
            isAuthenticated = User?.Identity?.IsAuthenticated,
            authenticationType = User?.Identity?.AuthenticationType
        });
    }

    [HttpGet("claims")]
    public IActionResult GetUserClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

        return Ok(new
        {
            message = "All user claims from JWT token",
            claims
        });
    }

    [HttpPut("displayname")]
    public IActionResult UpdateDisplayName([FromBody] UpdateDisplayNameRequest request)
    {
        // In a real app, you'd update the user in the database
        var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        return Ok(new
        {
            message = "Display name updated successfully",
            oldDisplayName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            newDisplayName = request.DisplayName,
            userEmail = currentUserEmail
        });
    }
}

public class UpdateDisplayNameRequest
{
    public string DisplayName { get; set; } = string.Empty;
}