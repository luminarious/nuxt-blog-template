import dayjs from 'dayjs'
import lunr from 'lunr'
import * as z from 'zod'

import idxJson from '@/build/idx.json'
import rawJson from '@/build/raw.json'

import { dotPropPick } from './lib/util'

let idx

const zProps = z.object({
	q: z.string(),
	tag: z.string().optional(),
	offset: z.number(),
	select: z.array(z.string()),
})

export const doSearch = (props) => {
	const { q = '', tag, offset = 0, select } = zProps.parse(props)
	let allData

	if (q) {
		idx = idx || lunr.Index.load(idxJson)

		allData = idx.search(q).map(({ ref }) => {
			return rawJson[ref]
		})
	} else {
		allData = Object.values(rawJson)
	}

	if (tag) {
		allData = allData.filter((d) => d.tag?.includes(tag))
	}

	const count = allData.length
	const result = allData
		.sort(({ date: a }, { date: b }) => {
			return a
				? b
					? dayjs(b)
							.toISOString()
							.localeCompare(dayjs(a).toISOString())
					: -1
				: 1
		})
		.slice(offset, offset + 5)
		.map((el) => dotPropPick(el, select))

	return {
		count,
		result,
	}
}
