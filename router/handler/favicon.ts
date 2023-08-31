export default async function handler(_req: Request, _params: Record<string, string>): Promise<Response> {
  const img = await Deno.readFile("./static/favicon.ico")
  return new Response(img, {
    status: 200,
    headers: {
      "content-type": "image/vnd.microsoft.icon",
      "cache-control": `max-age=${365 * 24 * 60 * 60}`, // cache seconds
    },
  })
}
