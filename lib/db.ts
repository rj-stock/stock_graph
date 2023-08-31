// 数据库连接
import { log, postgres, projectConfig as project } from "../deps.ts"
const logger = () => log.getLogger("lib/db")

/** 数据源接口 */
export type DataSource = {
  host: string
  port: number
  database: string
  username: string
  password: string
  // Max number of connections
  max?: number
  // Idle connection timeout in seconds
  idleTimeout?: number
  // Connect timeout in seconds
  connectTimeout?: number
}

// 缓存
const dataSources: Record<string, postgres.Sql> = {}

// 输出 sql 的 debug 函数
// deno-lint-ignore no-explicit-any
function showSql(_connection: number, query: string, parameters: any[], paramTypes: any[]): void {
  console.log(`query=${query}`)
  console.log(`parameters=${parameters}`)
  console.log(`paramTypes=${paramTypes}`)
}

/** 创建指定的数据库连接配置 */
export function getSql(name = "default"): postgres.Sql {
  // 优先返回缓存
  if (Object.hasOwn(dataSources, name)) return dataSources[name]

  // 无就创建一个
  const dbs = project.dbs as Record<string, DataSource>
  if (!Object.hasOwn(dbs, name)) throw Error(`缺少 "${name}" 数据源配置`)
  const db = dbs[name]
  logger().info(
    `initial a new "${name}" db connect with ${JSON.stringify(Object.assign({}, db, { password: "******" }))}`,
  )
  const p = postgres({
    host: db.host,
    port: db.port,
    database: db.database,
    username: db.username,
    password: db.password,
    max: db.max, // Max number of connections，default 10
    //max_lifetime: null,              // Max lifetime in seconds (more info below)
    idle_timeout: db.idleTimeout, // Idle connection timeout in seconds
    connect_timeout: db.connectTimeout, // Connect timeout in seconds
    connection: {
      // 应用程序名称，默认值是 'postgres.js.$ID'
      application_name: `postgres.js.${name}`,
      TimeZone: "Asia/Chongqing",
      // timezone_abbreviations: "CST",
      // timezone: "Asia/Chongqing" CST UTC+8 +08:00,
    },
    // https://github.com/porsager/postgres/tree/master/deno#data-transformation
    transform: {
      // 配置 camelCase 属性名 与 数据库 snake_case 列名之间的双向互转
      ...postgres.camel,
      // 配置 js 的 undefined 值自动转为 null 值后再发送给数据库（默认 undefined 是会抛异常的）
      // 注：从数据库查回的 null 值依然是 js 的 null 值，不会转为 undefined 值
      undefined: null,
    },
    debug: project.showSql ? showSql : false, // 设置为 showSql 可以在终端输出实际的 sql 语句
  }) // will use psql environment variables

  // cache it
  dataSources[name] = p

  // return it
  return p
}

/** 结束所有连接。 */
export async function endAll(): Promise<void> {
  for await (const [name, sql] of Object.entries(dataSources)) {
    await sql.end({ timeout: 5 })
    delete dataSources[name]
  }
}
