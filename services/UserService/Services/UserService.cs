using Microsoft.EntityFrameworkCore;
using System.Data;
using UserService.Constants;
using UserService.Data;
using UserService.Models;

namespace UserService.Services;
public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> UserExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<User> RegisterAsync(RegisterRequest request, string role = Roles.User)
    {
        try
        {
            // Check if user already exists
            if (await UserExistsAsync(request.Email))
            {
                _logger.LogWarning("Registration failed - user already exists: {Email}", request.Email);
                throw new Exception("User with this email already exists.");
            }

            // Validate role
            if (!Roles.All.Contains(role))
            {
                _logger.LogWarning("Role is invalid: {role}", role);
                throw new ArgumentException($"Invalid role: {role}");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                DisplayName = request.DisplayName,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User registered successfully: {Email} with role: {Role}", request.Email, user.Role);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user: {Email}", request.Email);
            throw;
        }
    }

    public async Task<User?> LoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting login for user: {Email}", request.Email);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                _logger.LogWarning("Login failed - user not found: {Email}", request.Email);
                return null;
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                _logger.LogWarning("Login failed - invalid password for user: {Email}", request.Email);
                return null;
            }

            _logger.LogInformation("Login successful for user: {Email} with role: {Role}", request.Email, user.Role);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Email}", request.Email);
            throw;
        }
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<User?> UpdateUserRoleAsync(Guid userId, string newRole)
    {
        if (!Roles.All.Contains(newRole))
        {
            throw new ArgumentException($"Invalid role: {newRole}");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return user;
    }
}