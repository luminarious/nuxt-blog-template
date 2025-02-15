import path from 'path'

import dotenv from 'dotenv'

dotenv.config()

export const CONTENT_PATH =
  process.env.CONTENT_PATH || path.resolve(process.cwd(), 'content')

export const srcPostPath = (...ps) =>
  path.join(CONTENT_PATH, 'post', ...ps)

export const srcMediaPath = (...ps) =>
  path.join(CONTENT_PATH, 'media', ...ps)

export const buildPath = (...ps) =>
  path.join(import.meta.dirname, '../build', ...ps)

export const dstMediaPath = (...ps) =>
  path.join(import.meta.dirname, '../static/media', ...ps)
