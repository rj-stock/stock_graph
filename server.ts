import DEFAULT_CONFIG from "./default.ts"
import { log, parseArgs, setupProject } from "./deps.ts"
import router from "./router/mod.ts"
const logger = () => log.getLogger("server")

// Init project config
const project = setupProject(parseArgs(Deno.args)["c"], DEFAULT_CONFIG)
logger().critical(`${project.name} v${project.version} ${project.author}`)

// Start server
// https://deno.land/manual@v1.35.1/runtime/http_server_apis
const port = (project.server as Record<string, unknown>)?.port as number
Deno.serve({ port }, (req) => {
  const url = new URL(req.url)
  logger().debug(`${req.method} ${url.pathname}`)
  return router.route(req)
})
