import { stripIndent } from './indent.js'
import { tokenize } from './tokenize.js'
import { h } from './h.js'

export default class HyperPug {
	constructor(filters = {}) {
		this.filters = filters
	}

	parse(s) {
		return this.precompile(s).join('')
	}

	precompile(s) {
		let key = ''
		let childrenRows = []
		const nodes = []

		let isInFilter = false

		for (const r of stripIndent(s).split('\n')) {
			if (!r[0] || (r[0] && r[0] !== ' ')) {
				isInFilter = false
			}

			if (/\S/.test(r[0] || ' ') && !isInFilter) {
				if (r[0] === ':') {
					isInFilter = true
				}

				if (key) {
					nodes.push(this.generate(key, childrenRows))
					childrenRows = []
				}

				key = r
				continue
			}

			childrenRows.push(r)
		}

		if (key) {
			nodes.push(this.generate(key, childrenRows))
		}

		return nodes
	}

	generate(key, childrenRows) {
		const c = childrenRows.join('\n')
		const children = c ? this.precompile(c) : undefined

		if (key[0] === ':') {
			return this.buildH(key, '', stripIndent(c))
		}

		let attrs = ''

		if (key[0] === ':') {
			return this.buildH(key, attrs, stripIndent(c))
		}

		const { key: k1, dict, suffix, content } = tokenize(key)

		if (dict) {
			attrs = dict
		}

		if (suffix === '.') {
			return this.buildH(k1, attrs, stripIndent(c))
		} else if (suffix === ':') {
			return this.buildH(k1, attrs, this.precompile(content))
		}

		return this.buildH(k1, attrs, content || children || [])
	}

	buildH(key, attrs, children) {
		if (key[0] === ':') {
			const filterName = key.substr(1)
			const fn = this.filters[filterName]
			if (!fn) {
				throw new Error(`Filter not installed: ${filterName}`)
			}

			if (typeof children !== 'string') {
				throw new Error(`Nothing to feed to filter: ${filterName}`)
			}

			return h('div', '', [fn(children)])
		}

		try {
			return h(key, attrs, children)
		} catch (e) {
			return h('div', attrs, children)
		}
	}
}