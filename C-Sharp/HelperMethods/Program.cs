namespace HelperMethods
{
    public class Program
    {
        public static void Main()
        {
            var test = new StringHelpers();

            test.UrlContainsFile("https://cdn.skoda.at/media/Model_Stage_Image_Component/4756-stage-image/dh-991-e9d92a/767967fa/1656916962/skoda-octavia-rs-m67-introduction?id=2&name=Peter", out string result);

            var outcome = result;
        }
    }
}
   