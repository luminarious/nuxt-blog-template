import { defineEventHandler, getQuery, sendJson } from "h3";
import lunr, { Index } from "lunr";

import idxJson from "../../build/idx.json";
import rawJson from "../../build/raw.json";

let idx: Index;

export default defineEventHandler((event) => {
	const { q, tag, offset = "0" } = getQuery(event);

	let allData;

	if (q) {
		idx = idx || lunr.Index.load(idxJson);

		allData = idx.search(q.toString()).map(({ ref }) => rawJson[ref]);
	} else {
		allData = Object.values(rawJson);
	}

	if (tag) {
		allData = allData.filter((d) => d.tag && d.tag.includes(tag.toString()));
	}

	const count = allData.length;
	const result = allData
		.sort(({ date: a }, { date: b }) => (a ? (b ? b.localeCompare(a) : a) : b))
		.slice(
			parseInt(offset.toString(), 10),
			parseInt(offset.toString(), 10) + 5,
		);

	return { count, result }
});
