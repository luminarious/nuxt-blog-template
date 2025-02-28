import fs from "fs";
import dayjs from "dayjs";

import rawJson from "./build/raw.json";
import { getTheme } from "./types/theme";
const theme = await getTheme();

export default defineNuxtConfig({
	telemetry: false,

	future: {
		compatibilityVersion: 4,
	},

	app: {
		head: {
			htmlAttrs: { lang: "en" },
			title: theme.title,
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{
					name: "description",
					content: theme.description || "",
				},
			],
			link: [{ rel: "icon", type: "image/x-icon", href: "/media/favicon.ico" }],
			script: theme.analytics?.plausible
				? [
						{
							src: "https://plausible.io/js/plausible.js",
							async: true,
							defer: true,
							"data-domain": theme.analytics?.plausible,
						},
					]
				: [],
		},
	},

	css: [],
	modules: [],

	// Replaces env variables with runtimeConfig
	runtimeConfig: {
		public: {
			title: theme.title,
			baseUrl: theme.baseUrl,
			remark42Config: theme.comments?.remark42 || null,
			author: theme.author,
			social: theme.social || {},
			BlogLayout: {
				banner: theme.banner,
				tabs: theme.tabs,
				sidebar: theme.sidebar,
				tagCloudData: JSON.parse(fs.readFileSync("./build/tag.json", "utf-8")),
				hasSocial: !!theme.social,
			},
		},
	},

	build: {
		postcss: {
			plugins: {
				tailwindcss: {},
			},
		},
	},

	nitro: {
		routeRules: {
			"/.netlify/functions/**": { proxy: "http://localhost:9000" },
		},
	},

	generate: {
		crawler: false,
		routes() {
			const routes = ["/", "/blog"];

			const blog = new Set();
			const tag = new Map();

			const getUrl = ({ path }: { path: string }) => `/post/${path}`;

			for (const [path, { tag, date }] of Object.entries<{ tag?: string[]; date?: string }>(rawJson)) {
				const p = { path, date: date ? dayjs(date).toDate() : undefined };
				blog.add(p);
				routes.push(getUrl(p));

				for (const t of (tag || [])) {
					const ts = tag.get(t) || new Set();
					ts.add(p);
					tag.set(t, ts);
				}
			}

			for (const i of Array.from({ length: Math.ceil(blog.size / 5) }, (_, i) => i)) {
				if (i > 0) routes.push(`/blog/${i + 1}`);
			}

			for (const [ts, t] of tag) {
				for (const i of Array.from({ length: Math.ceil(ts.size / 5) }, (_, i) => i)) {
					routes.push(i > 0 ? `/tag/${t}/${i + 1}` : `/tag/${t}`);
				}
			}

			return routes;
		},
	},

	compatibilityDate: "2025-02-15",
});
