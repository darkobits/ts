import env from '@darkobits/env'
import consola, { LogLevels } from 'consola'

const logLevel = env<keyof typeof LogLevels>('LOG_LEVEL')

const log = consola.create({})

if (logLevel && Reflect.has(LogLevels, logLevel)) {
  log.level = LogLevels[logLevel]
}

export default log