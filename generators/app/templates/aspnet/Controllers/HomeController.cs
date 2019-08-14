using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

/* fixformat ignore:start */
namespace <%= c_aspnet_project_name %>.Controllers 
/* fixformat ignore:end */
{
    public class HomeController : Controller {
        public HomeController (IConfiguration configuration) {
            Configuration = configuration;
        }
        public IConfiguration Configuration { get; }

        public IActionResult Index () {
            return View ();
        }

        /// <summary>
        /// This is for health checking used by DevOps
        /// </summary>
        /// <returns></returns>
        [Route ("APIHealthCheck")]
        public IActionResult HealthCheck () {
            return Ok ();
        }
    }
}