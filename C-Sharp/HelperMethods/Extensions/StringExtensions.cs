using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

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

        public static bool UrlContainsFile(this string input, out string result)
        {
            var decoded = HttpUtility.UrlDecode(input);

            //Handling url with parameters
            if (decoded.IndexOf("?") is { } queryIndex && queryIndex != -1)
            {
                decoded = decoded.Substring(0, queryIndex);
            }
            var fileName = Path.GetFileName(decoded);

            if (HasValidFileExtension(fileName))
            {
                result = fileName;
                return true;
            }
            result = string.Empty;
            return false;
        }

        public static bool HasValidFileExtension(this string fileName)
        {
            var validFileExtensions = @"^.*\.(jpg|JPG|png|PNG|gif|GIF|doc|DOC|docx|DOCX|pdf|PDF|txt|TXT)$";

            return Regex.IsMatch(
                fileName,
                validFileExtensions);
        }
    }
}
