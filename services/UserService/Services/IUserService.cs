using UserService.Constants;
using UserService.Models;

namespace UserService.Services;

public interface IUserService
{
    Task<User> RegisterAsync(RegisterRequest request, string role = Roles.User);
    Task<User?> LoginAsync(LoginRequest request);
    Task<bool> UserExistsAsync(string email);
    Task<List<User>> GetAllUsersAsync();
    Task<User?> UpdateUserRoleAsync(Guid userId, string newRole);
}