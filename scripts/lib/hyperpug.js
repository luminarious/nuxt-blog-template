function error(msg, ErrorClass = Error) { throw new ErrorClass(msg) }
function ok(b, msg = 'ok() failed') { if (b) { return ok } error(`NOT ok: ${msg}\n`) }

/**
 * Encodes `<` and `>` characters in a string to their HTML entity equivalents.
 * @param {string} s The input string.
 * @returns {string} The encoded string.
 */
function encodeInnerHTML(s) {
	const map = {
		'<': '&lt;',
		'>': '&gt;',
	}
	return s.split('').map((c) => map[c] || c).join('')
}

/**
 * Constructs an HTML element string with optional classes and ID parsed from `name`.
 * @param {string} name The tag name, possibly with `.class` or `#id`.
 * @param {string} eqdict A string representing attributes, e.g. `id="foo" class="bar"`.
 * @param {string|string[]} children The inner content, either a string or an array of strings.
 * @returns {string} The resulting HTML string.
 */
const h = (name, attrs, children) => {
	const childrenNodes = typeof children === 'string' ? [encodeInnerHTML(children)] : children

	let eqdict = ` ${attrs}`
	const classes = []
	name = name.replace(/\.[^'"#.]+/g, (p0) => {
		classes.push(p0.substring(1))
		return ''
	})

	let classList = ''
	eqdict = eqdict.replace(/\sclass=(['"])([^'"]*?)\1/g, (_full, _quote, classList_) => {
		classList = classList_
		return ''
	})

	classList = [classList.trim(), ...classes].join(' ').trim()
	if (classList) eqdict = `class="${classList}" ${eqdict}`

	let id = ''
	name = name.replace(/#[^'"#.]+/g, (p0) => {
		id = p0.substring(1)
		return ''
	})

	if (id) {
		eqdict = eqdict.replace(/\sid=(['"])[^'"]*?\1/g, '')
		eqdict = `id="${id}" ${eqdict}`
	}

	eqdict = eqdict.trim()
	if (!name) name = 'div'

	return `<${name}${eqdict ? ` ${eqdict}` : ''}>${childrenNodes.join('')}</${name}>`
}

/**
 * Determines the smallest indentation in a multiline string
 * @param s The input string
 * @param allowed The allowed indentation characters
 * @returns {number} The smallest indent across non-empty lines
 */
function getIndent(s, allowed = [' ', '\t']) {
	let count = []
	let minIndent = Number.POSITIVE_INFINITY

	for (const line of s.split('\n')) {
		if (!line.trim()) continue

		const indent = /^[ \t]*/.exec(line)[0]
		count = allowed.map((c, i) => count[i] + indent.includes(c))

		ok(count.filter(c => c > 1).length <= 1, `Mixed indentation detected in line: ${line}`)
		minIndent = Math.min(minIndent, indent.length)
	}
	return minIndent === Number.POSITIVE_INFINITY ? 0 : minIndent
}

/**
 * Removes the smallest common indentation from every line.
 * @param {string} s The input string.
 * @returns {string} The string with indentation removed.
 */
function stripIndent(s) {
	const indent = getIndent(s)
	return s.split('\n').map((r) => r.slice(indent)).join('\n')
}

/**
 * Breaks a line into its meaningful parts: key (tag name), dict (attributes), suffix, and content.
 * @param {string} s A single line of input.
 * @returns {{key: string, dict: string, suffix: string, content: string}} The tokenized parts.
 */
function tokenize(s) {
	let key = ''
	let dict = ''
	let suffix = ''
	let content = ''

	let wasInsideBracket = false
	let wasExitBracket = false
	let wasEndOfKey = false

	const bracketStack = []

	for (const c of s.split('')) {
		if (c === '(') {
			bracketStack.push(c)
			wasInsideBracket = true
			continue
		}
		if (c === ')') {
			bracketStack.pop()
			if (bracketStack.length === 0) wasExitBracket = true
			continue
		}
		if ([' ', ':'].includes(c)) {
			wasEndOfKey = true
		}
		if (!wasInsideBracket) {
			if (wasEndOfKey) {
				content += c
			} else {
				key += c
			}
		} else if (!wasExitBracket) {
			dict += c
		} else {
			content += c
		}
	}

	if ([':', '.'].some((el) => content.startsWith(el))) {
		suffix = content[0]
		content = content.slice(1)
	}
	if ([':', '.'].some((el) => key.endsWith(el))) {
		suffix = key[key.length - 1]
		key = key.slice(0, key.length - 1)
	}

	content = content.trim()

	return {
		key,
		dict,
		suffix,
		content,
	}
}

/**
 * A small templating engine that parses an indented text format into HTML.
 */
export default class HyperPug {
	/**
	 * @param {Record<string, (input: string) => string>} filters A set of filter functions keyed by name.
	 */
	constructor(filters = {}) {
		this.filters = filters
	}

	/**
	 * Parses an indented string into HTML.
	 * @param {string} s The input string.
	 * @returns {string} The resulting HTML string.
	 */
	parse(s) {
		return this.precompile(s).join('')
	}

	/**
	 * Processes an input string into an array of HTML fragments.
	 * @param {string} s The input string.
	 * @returns {string[]} An array of HTML pieces.
	 */
	precompile(s) {
		let key = ''
		let childrenRows = []
		const nodes = []
		let isInFilter = false

		for (const r of stripIndent(s).split('\n')) {
			if (!r[0] || (r[0] && !r.startsWith(' '))) {
				isInFilter = false
			}
			if (/\S/.test(r[0] || ' ') && !isInFilter) {
				if (r.startsWith(':')) {
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

	/**
	 * Takes a line (key) and any child rows, and produces HTML.
	 * @param {string} key The line's tag or filter notation.
	 * @param {string[]} childrenRows The indented child lines.
	 * @returns {string} An HTML string fragment.
	 */
	generate(key, childrenRows) {
		const c = childrenRows.join('\n')
		const children = c ? this.precompile(c) : undefined
		if (key.startsWith(':')) return this.buildH(key, '', stripIndent(c))

		let attrs = ''
		if (key.startsWith(':')) return this.buildH(key, attrs, stripIndent(c))

		const { key: k1, dict, suffix, content } = tokenize(key)
		if (dict) attrs = dict
		if (suffix === '.') return this.buildH(k1, attrs, stripIndent(c))
		if (suffix === ':') return this.buildH(k1, attrs, this.precompile(content))
		return this.buildH(k1, attrs, content || children || [])
	}

	/**
	 * Builds HTML with optional filtering if `key` starts with `:`.
	 * @param {string} key Tag name or `:filterName`.
	 * @param {string} attrs Attributes string.
	 * @param {string|Array} children Inner content or children.
	 * @returns {string} The resulting HTML string.
	 */
	buildH(key, attrs, children) {
		if (key.startsWith(':')) {
			const filterName = key.slice(1)
			const fn = this.filters[filterName]
			if (!fn) throw new Error(`Filter not installed: ${filterName}`)
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
