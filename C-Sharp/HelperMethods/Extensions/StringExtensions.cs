using System.Security.Cryptography;
using System.Text;

namespace HelperMethods.Extensions
{
    public static class StringExtensions
    {
        public static string ComputeSha1Hash(this string input)
        {
            // Create a SHA1   
            using (SHA1 sha1Hash = SHA1.Create())
            {
                // ComputeHash - returns byte array  
                byte[] bytes = sha1Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

                // Convert byte array to a string   
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}
