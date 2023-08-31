import { crawlK, KPeriod, log, StockKData } from "../../deps.ts"
const logger = () => log.getLogger("router/handler/kdata")

export default async function handler(_req: Request, params: Record<string, string>): Promise<Response> {
  logger().info(() => `params=${JSON.stringify(params, null, 2)}`)
  const kdata: StockKData = await crawlK(params.code, params.period as KPeriod)
  return new Response(JSON.stringify(kdata), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
