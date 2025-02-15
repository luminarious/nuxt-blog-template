import { CacheMedia } from './make-html-functions/cache.js'
import { MakeHtml } from './make-html-functions/frontend.js'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import lunr from 'lunr'
import * as z from 'zod'

import { clean } from './clean.js'
import { buildPath, dstMediaPath, srcMediaPath, srcPostPath } from './dir.js'

export async function buildIndexes() {
  clean()

  const files = await fg('**/*.md', {
    cwd: srcPostPath()
  })
  const rawJson = []

  await Promise.all(
    files.map(async (f) => {
      const slug = f.replace(/^.+\//, '').replace(/\.mdx?$/, '')
      let header = {}
      let markdown = fs.readFileSync(srcPostPath(f), 'utf8')

      if (markdown.startsWith('---')) {
        const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
        if (match) {
          header = yaml.load(match[1].trim(), { schema: yaml.JSON_SCHEMA }) || {}
          markdown = match[2].trim()
        }
      }

      const makeHtml = new MakeHtml(slug)
      const cacheMedia = new CacheMedia(dstMediaPath())

      const { title, date, image: unlocalizedImage, tag } = (() => {
        const { title, date, image, tag } = header
        return z
          .object({
            title: z.string(),
            date: z.string().optional(),
            image: z.string().optional(),
            tag: z.array(z.string()).optional()
          })
          .parse({ title, date, image, tag })
      })()

      const image = unlocalizedImage
        ? await cacheMedia.localizeImage(unlocalizedImage)
        : null

      const contentHtml = await cacheMedia.parse(makeHtml.render(markdown))

      const excerpt = markdown.split(/<!-- excerpt(?:_separator)? -->/)[0]
      const excerptHtml = contentHtml.split(
        /<!-- excerpt(?:_separator)? -->/
      )[0]

      const p = {
        path: f.replace(/\.mdx?$/, ''),
        slug,
        title,
        date: date ? dayjs(date).toISOString() : undefined,
        image: image ? `/media/${image}` : undefined,
        tag: (tag || []).map((t) => t.toLocaleLowerCase().replace(/ /g, '-')),
        excerpt,
        excerptHtml,
        contentHtml
      }

      rawJson.push(p)
    })
  )

  fs.writeFileSync(
    buildPath('raw.json'),
    JSON.stringify(
      rawJson.reduce(
        (prev, { path, ...p }) => ({ ...prev, [path]: { path, ...p } }),
        {}
      )
    )
  )
  fs.writeFileSync(
    buildPath('idx.json'),
    JSON.stringify(
      lunr(function () {
        this.ref('path')
        this.field('slug', { boost: 5 })
        this.field('title', { boost: 5 })
        this.field('tag', { boost: 5 })
        this.field('excerpt')

        rawJson.map((doc) => {
          this.add(doc)
        })
      })
    )
  )
  fs.writeFileSync(
    buildPath('tag.json'),
    JSON.stringify(
      rawJson.reduce((prev, { tag = [] }) => {
        const ts = tag

        ts.map((t) => {
          prev[t] = (prev[t] || 0) + 1
        })

        return prev
      }, {})
    )
  )
    ; (
      await fg('**/*.*', {
        cwd: srcMediaPath()
      })
    ).map((f) => {
      fs.ensureFileSync(dstMediaPath(f))
      fs.copyFileSync(srcMediaPath(f), dstMediaPath(f))
    })
}

buildIndexes()
