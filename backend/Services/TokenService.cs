using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    /// <summary>
    /// Service interface for JWT token management.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Creates a JWT token for the specified user.
        /// </summary>
        /// <param name="user">User to create token for</param>
        /// <returns>Encoded JWT token string</returns>
        string CreateToken(User user);
    }

    /// <summary>
    /// Service for creating and managing JWT tokens.
    /// </summary>
    public class TokenService : ITokenService
    {
        private readonly string _jwtKey;
        public TokenService()
        {
            _jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")!;
        }

        /// <summary>
        /// Creates a new JWT token for the specified user.
        /// Token expires after 24 hours.
        /// </summary>
        public string CreateToken(User user)
        {
            // Create user claims for the token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role!.Name)
            };
            // Create signing key from configuration
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // generate the token
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            // serialization of token to string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}