/** Inner config */
const INNER_CONFIG = {
  ts: new Date().toISOString(),
  version: "0.1.0",
  name: "Stock Graph",
  author: "@RJ rongjihuang@gmail.com",
}

/** Default config */
const DEFAULT_CONFIG = Object.assign({
  server: {
    port: 6001,
  },
  // log: {
  //   file: "app.log",
  //   loggers: {
  //     default: {
  //       level: "WARNING",
  //       handlers: ["console", "file"],
  //     },
  //   },
  // },
}, INNER_CONFIG)

export default DEFAULT_CONFIG
