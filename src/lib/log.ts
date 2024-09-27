import env from '@darkobits/env'
import consola, { LogLevels } from 'consola'

const logLevel = env<keyof typeof LogLevels>('LOG_LEVEL')

export default consola.create({
  level: (logLevel && LogLevels[logLevel]) ?? LogLevels.info
})