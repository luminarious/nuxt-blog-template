/**
 * Minimal Proof of Concept: whitespace-based parser
 * No external dependencies, single file example
 * 
 * 1) Lexer
 * 2) Modes
 * 3) Parser
 * 4) Plugin system
 * 5) Renderers
 */

function error(msg, ErrorClass = Error) { throw new ErrorClass(msg) }
function ok(b, msg = 'ok() failed') { if (b) { return ok } error(`NOT ok: ${msg}\n`) }

// ---------------------------------------------------------------------
// 1) LEXER: tokenizes input lines, tracks indentation
// ---------------------------------------------------------------------
export const tokens = {
	LINE_BREAK: Symbol('LINE_BREAK'),
	LINE_EMPTY: Symbol('LINE_EMPTY'),
	INDENT: Symbol('INDENT'),
}

export function tokenize(input, { debug = false } = {}) {
	const arr = []
	const lines = input.split('\n')
	const baseIndent = getIndent(input)

	for (const line of lines) {
		const indentStr = /^[ \t]*/.exec(line)[0]
		const indentLevel = baseIndent ? Math.floor(indentStr.length / baseIndent) : indentStr.length
		arr.splice(arr.length, 0, ...new Array(indentLevel).fill(tokens.INDENT))

		arr.push(line.slice(indentStr.length) || tokens.LINE_EMPTY)
		arr.push(tokens.LINE_BREAK)
	}

	return debug ? arr.map(token => (typeof token === 'symbol' ? token.description : token)) : arr
}

/**
 * Determines the smallest indentation in a multiline string
 * @param s The input string
 * @param allowed The allowed indentation characters
 * @returns {number} The smallest indent across non-empty lines
 */
function getIndent(s, allowed = [' ', '\t']) {
	let count = new Array(allowed.length).fill(0)
	let minIndent = Number.POSITIVE_INFINITY

	for (const line of s.split('\n')) {
		if (!line.trim()) continue

		const indent = /^[ \t]*/.exec(line)[0]
		count = allowed.map((c, i) => count[i] + indent.includes(c))

		ok(count.filter(c => c > 0).length <= 1, `Mixed indentation detected in line: ${line}`)
		minIndent = Math.min(minIndent, indent.length)
	}
	return minIndent === Number.POSITIVE_INFINITY ? 0 : minIndent
}

// ---------------------------------------------------------------------
// 2) MODES: define how certain text lines become nodes
// ---------------------------------------------------------------------
const modeDefinitions = {
	Markdown: {
		lineToNode: (text) => {
			if (text.startsWith('#')) {
				return { nodeType: 'headingNode', content: text.slice(1).trim() }
			}
			return { nodeType: 'mdTextNode', content: text }
		},
	},
}

// ---------------------------------------------------------------------
// 3) PARSER: build a node tree from tokens using the chosen mode
// ---------------------------------------------------------------------
function parse(tokens, modeName) {
	const mode = modeDefinitions[modeName] || modeDefinitions.HTML
	const root = { nodeType: 'root', children: [] }
	const stack = [root]

	for (const t of tokens) {
		if (t.type === 'INDENT') {
			// Enter new child list
			const newNode = { nodeType: 'block', children: [] }
			stack[stack.length - 1].children.push(newNode)
			stack.push(newNode)
		} else if (t.type === 'DEDENT') {
			stack.pop()
		} else if (t.type === 'TEXT') {
			const node = mode.lineToNode(t.value)
			stack[stack.length - 1].children.push(node)
		} else if (t.type === 'COMMENT') {
			stack[stack.length - 1].children.push({ nodeType: 'commentNode', content: t.value })
		}
	}
	return root
}

// ---------------------------------------------------------------------
// 4) PLUGIN SYSTEM: allow external hooks
// ---------------------------------------------------------------------
const plugins = []

function registerPlugin(plugin) {
	plugins.push(plugin)
}

// Example plugin: uppercase all textNode content
registerPlugin({
	name: 'uppercaseText',
	afterParse: (ast) => {
		function visit(node) {
			if (node.nodeType === 'textNode' || node.nodeType === 'mdTextNode') {
				node.content = node.content.toUpperCase()
			}
			if (node.children) {
				node.children.forEach(visit)
			}
		}
		visit(ast)
	},
})

// ---------------------------------------------------------------------
// 5) RENDERERS: convert AST to various outputs
// ---------------------------------------------------------------------
function toHtml(ast) {
	if (ast.nodeType === 'root' || ast.nodeType === 'block') {
		return ast.children.map(toHtml).join('')
	}
	if (ast.nodeType === 'elementNode') {
		return ast.content // naive pass-through
	}
	if (ast.nodeType === 'headingNode') {
		return `<h1>${ast.content}</h1>`
	}
	if (ast.nodeType === 'textNode' || ast.nodeType === 'mdTextNode') {
		return `<p>${ast.content}</p>`
	}
	if (ast.nodeType === 'commentNode') {
		return `<!-- ${ast.content} -->`
	}
	return ''
}

function toJson(ast) {
	return JSON.stringify(ast, null, '\t')
}

// Example stub for PDF or other outputs
function toPdf(ast) {
	// placeholder
	return 'PDF rendering not implemented'
}
