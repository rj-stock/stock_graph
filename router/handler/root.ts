import { projectConfig as project } from "../../deps.ts"

export default function handler(_req: Request, _params: Record<string, string>): Response {
  return new Response(
    `<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>Stock Graph Demo</title>
</head>
<body>
  <h1>${project.name}</h1>
  <div>version: ${project.version}</div>
  <div>ts: ${project.ts}</div>
  <footer>Copyright ${project.author}</footer>
</body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": `max-age=${1 * 24 * 60 * 60}`, // cache seconds
      },
    },
  )
}
