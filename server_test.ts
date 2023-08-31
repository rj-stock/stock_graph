import { assert, assertEquals, pathExistsSync } from "./deps.ts"

const serverUrl = "http://localhost:6001"

Deno.test("GET /", async () => {
  let res = await fetch(`${serverUrl}/`)
  assert((await res.text()).includes("version"))

  res = await fetch(serverUrl)
  assert((await res.text()).includes("version"))
})

Deno.test("GET /favicon.ico", async () => {
  const res = await fetch(`${serverUrl}/favicon.ico`)
  assertEquals(res.headers.get("content-type"), "image/vnd.microsoft.icon")
  if (res.body) {
    if (!pathExistsSync("temp")) Deno.mkdirSync("temp")
    const file = await Deno.open("temp/favicon.ico", { write: true, create: true })
    await res.body.pipeTo(file.writable)
  }
})

Deno.test("GET /unknown 404", async () => {
  const res = await fetch(`${serverUrl}/unknown`)
  assertEquals(res.status, 404)
  assertEquals(res.statusText, "Not Found")
  await res.body?.cancel()
})

Deno.test("GET /kdata/600255/day", async () => {
  const res = await fetch(`${serverUrl}/kdata/600255/day`)
  assertEquals(res.status, 200)
  assertEquals(res.headers.get("content-type"), "application/json; charset=utf-8")
  if (res.body) {
    if (!pathExistsSync("temp")) Deno.mkdirSync("temp")
    const file = await Deno.open("temp/600255_day.json", { write: true, create: true })
    await res.body.pipeTo(file.writable)
  }
})
