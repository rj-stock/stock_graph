/** 允许跨域访问的 OPTIONS 请求处理 */
import { log } from "../../deps.ts"
const logger = () => log.getLogger("router/handler/allow_cors")

export default function handler(req: Request, _params: Record<string, string>): Response {
  logger().debug(() => "allow cors for " + req.url)
  return new Response(undefined, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Authorization",
      // "Access-Control-Allow-Credentials": "true",
      // "Access-Control-Max-Age": "1728000", // seconds
      // 禁止浏览器缓存预检请求的结果
      // "Cache-Control": "no-store",
      // "Expires": "0",
    },
  })
}
