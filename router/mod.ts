// Config all router here
import { Router } from "../deps.ts"
import rootHandler from "./handler/root.ts"
import faviconHandler from "./handler/favicon.ts"
import allowCorsHandler from "./handler/allow_cors.ts"
import fileHandler from "./handler/file.ts"
import kdataHandler from "./handler/kdata.ts"

const router = new Router()
//==== root
router.get("/", rootHandler)
router.get("/favicon.ico", faviconHandler)

//==== static files
router.get("/static/*", fileHandler)

//==== api router
// kdata
router.get("/kdata/:code/:period", kdataHandler)
router.options("/kdata/:code/:period", allowCorsHandler)

export default router
