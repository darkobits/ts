// import {
//   // debugEventLoop,
//   findHangingPromises,
//   registerShutdownHandlers
// } from './lib/debug-utils'

// findHangingPromises()
// registerShutdownHandlers()

/**
 * Vite configuration presets based on project type.
*/
export * as vite from './config/vite'

export { defaultPackageScripts } from './config/package-scripts'
export { gitDescribe } from './lib/utils'