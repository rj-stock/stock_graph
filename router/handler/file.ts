import { contentType, extname, joinPath, pathExists } from "../../deps.ts"

/** Web 前端文件类型 */
const WEB_FILE_EXTS = [".html", ".htm", ".js", ".css", ".ico", ".png", ".jpeg", ".jpg", ".gif"]
/** 判断扩展名是不是 Web 前端文件类型 */
function isWebFile(ext: string): boolean {
  return WEB_FILE_EXTS.includes(ext)
}

/**
 * 静态文件下载。
 * `params[0]` 的值为静态文件相对于 static 目录下的相对路径
 */
export default async function handler(_req: Request, params: Record<string, string>): Promise<Response> {
  const file = joinPath("static", params["0"])
  const ext = extname(file)
  const ct = contentType(ext) || "application/octet-stream"
  // console.log(`file=${file}, ext=${ext}, ct=${ct}`)

  if (!(await pathExists(file))) return new Response(`File '${file}' not exists`, { status: 404 })

  const body = await Deno.readFile(file) // TODO zero-copy
  return new Response(body, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "content-type": ct,
      "cache-control": isWebFile(ext) ? `max-age=${365 * 24 * 60 * 60}` : "no-store", // cache seconds
    },
  })
}
