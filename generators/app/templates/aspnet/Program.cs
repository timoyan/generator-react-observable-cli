using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

/* fixformat ignore:start */
namespace <%= c_aspnet_project_name %>
/* fixformat ignore:end */
{
    public class Program {
        public static void Main (string[] args) {
            BuildWebHost (args).Run ();
        }

        public static IWebHost BuildWebHost (string[] args) {
            IConfigurationRoot config = new ConfigurationBuilder ()
                .Build ();

            return WebHost.CreateDefaultBuilder (args)
                .UseConfiguration (config)
                .UseStartup<Startup> ()
                .Build ();
        }
    }
}