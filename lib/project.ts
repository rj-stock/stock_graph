import { BaseHandler, formatDateTime, log, parseJsonc, pathExistsSync, recursiveAssign } from "../deps.ts"
const logger = () => log.getLogger("lib/project")

/** 项目配置类型 */
export type ProjectConfig = {
  ts: string
  version: string
  name: string
  author: string
} & Record<string, unknown>

// 无配置
const UNKNOWN_CONFIG: ProjectConfig = {
  ts: "unknown",
  version: "unknown",
  name: "unknown",
  author: "unknown",
}
// 最终配置
export const projectConfig: ProjectConfig = Object.assign({}, UNKNOWN_CONFIG)

/** 初始化项目并返回项目配置 */
export function setupProject(
  configFile = "app.jsonc",
  defaultConfig: Record<string, unknown> = UNKNOWN_CONFIG,
): ProjectConfig {
  // 加载配置文件
  if (!pathExistsSync(configFile)) {
    logger().warning(`项目配置文件 "${configFile}" 不存在，使用默认配置`)
    recursiveAssign(projectConfig, defaultConfig)
  } else {
    recursiveAssign(projectConfig, defaultConfig, parseJsonc(Deno.readTextFileSync(configFile)))
  }
  //console.log("projectConfig=" + JSON.stringify(projectConfig, null, 2))

  // 初始化日志配置
  if (projectConfig["log"]) {
    log.setup(createLogConfig(projectConfig["log"] as Record<string, unknown>) || {})
  }

  // 返回配置
  return projectConfig
}

// 根据 app.jsonc/log 的配置生成相应的 log.LogConfig
function createLogConfig(config: Record<string, unknown>): log.LogConfig {
  const logConfig: log.LogConfig = {}

  logConfig.loggers = (config.loggers || {}) as { [name: string]: log.LoggerConfig }
  logConfig.handlers = (config.handlers || {}) as { [name: string]: BaseHandler }

  if (config.file) {
    // logConfig.handlers.file = new log.handlers.FileHandler("INFO", {
    //   filename: config.file as string,
    //   formatter: fileFormatter,
    // })
    logConfig.handlers.file = new log.handlers.RotatingFileHandler("INFO", {
      filename: config.file as string,
      formatter: fileFormatter,
      maxBytes: 1024 * 1024,
      maxBackupCount: 10,
    })
  }
  if (!logConfig.handlers.console) {
    logConfig.handlers.console = new log.handlers.ConsoleHandler("DEBUG", {
      formatter: consoleFormatter,
    })
  }

  //console.log("logConfig=" + JSON.stringify(logConfig, null, 2))
  return logConfig
}

/**
 * Format current dataTime to specific style.
 *
 * @param {String} pattern default "yyyy-MM-ddTHH:mm:ss"
 * @returns {String}
 */
function ts(pattern = "yyyy-MM-ddTHH:mm:ss"): string {
  return formatDateTime(new Date(), pattern)
}
// log with format "13:00:00 INFO test"
const consoleFormatter: log.FormatterFunction = (r: log.LogRecord): string => {
  return `${ts()} ${r.levelName} [${r.loggerName}] ${r.msg}`
}

// log with format "2023-01-01T13:00:00 INFO [main] - test"
const fileFormatter: log.FormatterFunction = (r: log.LogRecord): string => {
  return `${ts()} ${r.levelName} [${r.loggerName}] ${r.msg}`
}
