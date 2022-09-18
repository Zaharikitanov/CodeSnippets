using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace ParallelExample
{
    class Program
    {
        static async Task Main()
        {
            var urls = new[] {
                    "https://github.com/naudio/NAudio",
                    "https://twitter.com/mark_heath",
                    "https://github.com/markheath/azure-functions-links",
                    //"https://pluralsight.com/authors/mark-heath",
                    "https://github.com/markheath/advent-of-code-js",
                    "http://stackoverflow.com/users/7532/mark-heath",
                    "https://mvp.microsoft.com/en-us/mvp/Mark%20%20Heath-5002551",
                    "https://github.com/markheath/func-todo-backend",
                    "https://github.com/markheath/typescript-tetris",
            };
            var client = new HttpClient();
            var maxThreads = 4;
            var q = new ConcurrentQueue<string>(urls);
            var tasks = new List<Task>();
            for (int n = 0; n < maxThreads; n++)
            {
                tasks.Add(Task.Run(async () => {
                    while (q.TryDequeue(out string url))
                    {
                        var html = await client.GetStringAsync(url);
                        Console.WriteLine($"retrieved {html.Length} characters from {url}");
                    }
                }));
            }
            await Task.WhenAll(tasks);
        }


        /// <summary>
        /// GetPrimeList returns Prime numbers by using sequential ForEach
        /// </summary>
        /// <param name="inputs"></param>
        /// <returns></returns>
        private static IList<int> GetPrimeList(IList<int> numbers) => numbers.Where(IsPrime).ToList();

        /// <summary>
        /// GetPrimeListWithParallel returns Prime numbers by using Parallel.ForEach
        /// </summary>
        /// <param name="numbers"></param>
        /// <returns></returns>
        private static IList<int> GetPrimeListWithParallel(IList<int> numbers)
        {
            var primeNumbers = new ConcurrentBag<int>();

            Parallel.ForEach(numbers, number =>
            {
                if (IsPrime(number))
                {
                    primeNumbers.Add(number);
                }
            });

            return primeNumbers.ToList();
        }

        /// <summary>
        /// IsPrime returns true if number is Prime, else false.(https://en.wikipedia.org/wiki/Prime_number)
        /// </summary>
        /// <param name="number"></param>
        /// <returns></returns>
        private static bool IsPrime(int number)
        {
            if (number < 2)
            {
                return false;
            }

            for (var divisor = 2; divisor <= Math.Sqrt(number); divisor++)
            {
                if (number % divisor == 0)
                {
                    return false;
                }
            }
            return true;
        }
    }
}