export type Handler = (
  request: Request,
  /** Path params */
  params: Record<string, string>,
) => Response | Promise<Response>

export const METHODS: Record<string, string> = {
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  PATCH: "PATCH",
}

export class Router {
  private routes: Record<string, Array<{ pattern: URLPattern; handler: Handler }>> = {}

  constructor() {
    for (const m in METHODS) {
      this.routes[METHODS[m]] = []
    }
  }

  private add(method: string, pathname: string, handler: Handler) {
    this.routes[method].push({
      pattern: new URLPattern({ pathname }),
      handler,
    })
  }

  get(pathname: string, handler: Handler) {
    this.add(METHODS.GET, pathname, handler)
  }

  head(pathname: string, handler: Handler) {
    this.add(METHODS.HEAD, pathname, handler)
  }

  post(pathname: string, handler: Handler) {
    this.add(METHODS.POST, pathname, handler)
  }

  put(pathname: string, handler: Handler) {
    this.add(METHODS.PUT, pathname, handler)
  }

  delete(pathname: string, handler: Handler) {
    this.add(METHODS.DELETE, pathname, handler)
  }

  options(pathname: string, handler: Handler) {
    this.add(METHODS.OPTIONS, pathname, handler)
  }

  trace(pathname: string, handler: Handler) {
    this.add(METHODS.TRACE, pathname, handler)
  }

  patch(pathname: string, handler: Handler) {
    this.add(METHODS.PATCH, pathname, handler)
  }

  route(req: Request): Response | Promise<Response> {
    for (const r of this.routes[req.method]) {
      if (r.pattern.test(req.url)) {
        const params = (r.pattern.exec(req.url)?.pathname?.groups || {}) as Record<string, string>
        try {
          return r["handler"](req, params)
        } catch (_err) {
          return new Response(null, { status: 500 })
        }
      }
    }
    return new Response(null, { status: 404 })
  }
}
