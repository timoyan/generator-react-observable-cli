using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

/* fixformat ignore:start */
namespace <%= c_aspnet_project_name %>
/* fixformat ignore:end */
{
    public class Startup {
        public Startup (IConfiguration configuration) {
            Configuration = configuration;
        }
        public IConfiguration Configuration { get; }
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices (IServiceCollection services) {
            services.AddMvc ();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure (IApplicationBuilder app, IHostingEnvironment env) {
            if (env.IsDevelopment ()) {
                app.UseDeveloperExceptionPage ();
            } else {
                app.UseExceptionHandler ("/Home/Error");
            }

            app.UseCors (builder => {
                builder.AllowAnyHeader ()
                    .AllowAnyMethod ()
                    .AllowAnyOrigin ();
            });

            app.UseStaticFiles ();

            app.UseMvc (routes => {
                routes.MapRoute (
                    name: "default",
                    template: "/{*url}",
                    defaults : new { controller = "Home", action = "Index" }
                );
            });
        }
    }
}