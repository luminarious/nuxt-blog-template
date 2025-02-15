import { rimraf } from 'rimraf'

import { buildPath, dstMediaPath } from './dir.js'

export function clean() {
  rimraf.sync(buildPath('*.json'), { glob: true })
  rimraf.sync(dstMediaPath('**/*'), { glob: true })
}
