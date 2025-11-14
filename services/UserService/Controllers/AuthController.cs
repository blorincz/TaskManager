using MessageContracts;
using MessageContracts.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared;
using UserService.Constants;
using UserService.Models;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IRabbitMQService _rabbitMQService;
        private readonly IJwtService _jwtService;
        private readonly ILogger _logger;

        public AuthController(IUserService userService, IRabbitMQService rabbitMQService, IJwtService jwtService, ILogger logger)
        {
            _userService = userService;
            _rabbitMQService = rabbitMQService;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _userService.RegisterAsync(request);
                var token = _jwtService.GenerateToken(user);

                if (user != null)
                {
                    // Publish UserRegisteredEvent to RabbitMQ
                    var userRegisteredEvent = new UserRegisteredEvent
                    {
                        UserId = user.Id,
                        DisplayName = request.DisplayName,
                        Email = request.Email,
                        RegisteredAt = DateTime.UtcNow
                    };

                    _rabbitMQService.PublishMessage(Queues.UserRegistered, userRegisteredEvent);
                    _logger.LogInformation("Published UserRegisteredEvent for user {DisplayName}", request.DisplayName);

                    return Ok(new
                    {
                        message = "User registered successfully",
                        token,
                        user = new { user?.Id, user?.Email, user?.DisplayName, user?.Role }
                    });
                }
                return BadRequest(new { message = "Unable to register user" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.LoginAsync(request);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new { user.Id, user.Email, user.DisplayName, user.Role }
            });
        }

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "UserService with JWT authentication is working!" });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            // This will only be accessible with a valid JWT token
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            return Ok(new
            {
                message = "This is a protected endpoint!",
                userId,
                userEmail,
                userName,
                userRole
            });
        }

        [HttpGet("profile")]
        public IActionResult GetUserProfile()
        {
            // Only accessible with valid JWT token
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            return Ok(new
            {
                message = "User profile data",
                email = userEmail,
                accessedAt = DateTime.UtcNow
            });
        }

        [HttpPost("register-admin")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
        {
            try
            {
                // In production, you might want additional checks here
                var user = await _userService.RegisterAsync(request, Roles.Admin);
                var token = _jwtService.GenerateToken(user);

                return Ok(new
                {
                    message = "Admin user registered successfully",
                    token,
                    user = new { user.Id, user.Email, user.DisplayName, user.Role }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}