import { defineEventHandler, getQuery, createError, sendJson } from "h3";
import rawJson from "../../build/raw.json";

export default defineEventHandler((event) => {
	const { path } = getQuery(event);

	if (!path) {
		throw createError({ statusCode: 400, message: "Path must be provided" });
	}

	const post = rawJson[path as string] || {};

	return post
});
