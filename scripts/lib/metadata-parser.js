import axios from "axios"
import domino from "domino"
import { getMetadata } from "page-metadata-parser"

export async function metadataParser(url) {
	const r = await axios.get(url, {
		transformResponse: (d) => d,
	})

	const doc = domino.createWindow(r.data).document;
	const { image, title, description } = await getMetadata(
		doc,
		url,
	)

	return {
		image,
		title,
		description,
	}
}
