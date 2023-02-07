using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace HelperMethods
{
    class Program
    {
        static async Task Main()
        {
            await DownloadFile();
        }

        private static async Task DownloadFile()
        {
            var downloadUrl = "https://cdn.skoda.at/media/Model_Stage_Image_Component/4756-stage-image/dh-991-e9d92a/767967fa/1656916962/skoda-octavia-rs-m67-introduction.png";
            var filename = "skoda.png";
            
            using var client = new HttpClient();
            using var fileStream = new MemoryStream(await client.GetByteArrayAsync(downloadUrl));
            Downloader.MaxThrottledBytes = 10000;
            Stopwatch stopwatch = Stopwatch.StartNew();
            Console.WriteLine("Started");

            Downloader.ReadFully(fileStream, $"new_{filename}");

            stopwatch.Stop();
            Console.WriteLine($"Elapsed: {stopwatch.ElapsedMilliseconds}");

        }
    }
}