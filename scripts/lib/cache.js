import crypto from "node:crypto"
import path from "node:path"

import axios from "axios"
import * as cheerio from 'cheerio'
import fs from "fs-extra"
import sharp from "sharp"
import sanitize from "sanitize-filename"

function isUrl(s) {
	if (/^https?:\/\/[^ ]+$/.test(s)) {
		try {
			// eslint-disable-next-line no-new
			new URL(s)
			return true
		} catch (_) { }
	}

	return false
}

function styleSizeToNumber(s) {
	return s?.endsWith("px") ? Number.parseInt(s) : null;
}

function extractFilenameFromUrl(
	u,
	fallback,
	opts,
) {
	try {
		const { pathname } = new URL(u)
		const unsafeFilename = decodeURIComponent(pathname.split("/").pop() ?? fallback)

		const safeFilename = sanitize(unsafeFilename)
		if (opts?.preferredExt && opts.preferredExt.length > 0) {
			const ext = (RegExp(/\..+$/).exec(safeFilename) || [])[0]
			if (!ext || !opts.preferredExt.includes(ext)) return safeFilename + opts.preferredExt[0]
		}

		return safeFilename
	} catch (_) { }

	return fallback
}

export class CacheMedia {
	async parse(html) {
		const $ = cheerio.load(html)

		await Promise.all(
			Array.from($("img:not([data-no-cache])")).map(async (el) => {
				const $el = $(el)
				await this.localizeImage($el)
			}),
		)

		return $("body").html() || html
	}

	async minimizeImage(data, $el) {
		let width = 800
		let height = null

		if ($el) {
			width = Number.parseInt($el.attr("width") || "") || Number.parseInt($el.attr("data-width") || "") || styleSizeToNumber($el.css("width"))

			height = Number.parseInt($el.attr("height") || "") || Number.parseInt($el.attr("data-height") || "") || styleSizeToNumber($el.css("height"))
		}

		return await sharp(data)
			.resize(width, height, {
				withoutEnlargement: true,
				fit: "outside",
			})
			// .toFormat('webp', { quality: 80 })
			.toBuffer()
	}

	/**
	 *
	 * @param im If used externally, it means full URL. Internally, it uses Cheerio.
	 */
	async localizeImage(im) {
		let src = ""
		let $el = null
		if (typeof im === "string") {
			src = im
		} else {
			$el = im;
			src = im.attr("src") || ""
		}

		if (src && isUrl(src)) {
			try {
				const { data } = await axios.get(src, {
					responseType: "arraybuffer",
				})

				const newUrl = `${crypto
					.createHash("sha256")
					.update(data)
					.digest("hex")}/${extractFilenameFromUrl(src, "image.png", {
						preferredExt: [".jpg", ".gif", ".png", ".jpeg", ".webp"],
					})}`

				if ($el) {
					$el.attr("src", `/media/${newUrl}`)
					$el.attr("data-original-src", src)
				}

				await fs.ensureFile(path.join(this.dst, newUrl))
				await fs.writeFile(
					path.join(this.dst, newUrl),
					await this.minimizeImage(data, $el),
				)

				return newUrl
			} catch (_) { }
		}

		return null
	}
}
