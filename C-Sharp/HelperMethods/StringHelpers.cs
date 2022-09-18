using System.Text.RegularExpressions;
using System.Web;

namespace HelperMethods
{
    public class StringHelpers
    {
        public bool UrlContainsFile(string input, out string result)
        {
            var decoded = HttpUtility.UrlDecode(input);
            
            //Handling url with parameters
            if (decoded.IndexOf("?") is { } queryIndex && queryIndex != -1)
            {
                decoded = decoded.Substring(0, queryIndex);
            }
            var fileName = Path.GetFileName(decoded);

            if (IsValidfileName(fileName))
            {
                result = fileName;
                return true;
            }
            result = string.Empty;
            return false;
        }

        public bool IsValidfileName(string fileName)
        {
            return !Regex.IsMatch(
                fileName,
                string.Format("[{0}]", Regex.Escape(new string(Path.GetInvalidFileNameChars()))));
        }
    }
}
