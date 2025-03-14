import {ConsoleLogger} from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"

export class SimpleLogger extends ConsoleLogger {

    private readonly logFilePath = path.join(__dirname, "logs/app.log")
    private readonly isWriteToFileEnabled: boolean = false

    constructor(isWriteToFileEnabled: boolean = false) {
        super()
        this.isWriteToFileEnabled = isWriteToFileEnabled
        this.ensureLogFileExists()
    }

    private ensureLogFileExists() {
        if (!this.isWriteToFileEnabled) return

        const dir = path.dirname(this.logFilePath)

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true})
        }
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, "")
        }
    }

    private writeToFile(message: string) {
        if (!this.isWriteToFileEnabled) return
        const timestamp = new Date().toISOString()
        const logMessage = `${timestamp} [${this.context}] ${message}\n`
        fs.appendFileSync(this.logFilePath, logMessage)
    }

    log(message: string) {
        super.log(message)
        this.writeToFile(`[LOG] ${message}`)
    }

    error(message: string, trace: string) {
        super.error(message, trace)
        this.writeToFile(`[ERROR] ${message} - ${trace}`)
    }

    warn(message: string) {
        super.warn(message)
        this.writeToFile(`[WARN] ${message}`)
    }

    debug(message: string) {
        super.debug(message)
        this.writeToFile(`[DEBUG] ${message}`)
    }

    verbose(message: string) {
        super.verbose(message)
        this.writeToFile(`[VERBOSE] ${message}`)
    }
}