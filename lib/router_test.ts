import { assertEquals } from "../deps.ts"

Deno.test("/path/:p1/:p2", () => {
  const pattern = new URLPattern({ pathname: "/path/:p1/:p2" })
  const url = "http://localhost:8080/path/a/b?k=v"
  const params = (pattern.exec(url)?.pathname?.groups || {}) as Record<string, string>
  assertEquals(params.p1, "a")
  assertEquals(params.p2, "b")
})

Deno.test("/static/* for static/a/b.html", () => {
  const pattern = new URLPattern({ pathname: "/static/*" })
  const url = "http://localhost:8080/static/a/b.html"
  const params = (pattern.exec(url)?.pathname?.groups || {}) as Record<string, string>
  // console.log(JSON.stringify(params, null, 2))
  assertEquals(params["0"], "a/b.html")
  assertEquals(params[0], "a/b.html")
})

Deno.test("/static/* for static/a.html", () => {
  const pattern = new URLPattern({ pathname: "/static/*" })
  const url = "http://localhost:8080/static/a.html"
  const params = (pattern.exec(url)?.pathname?.groups || {}) as Record<string, string>
  assertEquals(params["0"], "a.html")
  assertEquals(params[0], "a.html")
})

Deno.test("/static/* for static/a.html?k=v", () => {
  const pattern = new URLPattern({ pathname: "/static/*" })
  const url = "http://localhost:8080/static/a.html?k=v"
  const params = (pattern.exec(url)?.pathname?.groups || {}) as Record<string, string>
  assertEquals(params["0"], "a.html")
  assertEquals(params[0], "a.html")
})
