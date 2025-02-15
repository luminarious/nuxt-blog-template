export function getIndent(s) {
	const indents = []
	for (const r of s.split('\n')) {
		if (r.trim()) {
			const m = /^ */.exec(r)
			if (m) {
				indents.push(m[0].length)
			}
		}
	}

	if (indents.length === 0) {
		indents.push(0)
	}

	return Math.min(...indents)
}

export function stripIndent(s) {
	const indent = getIndent(s)
	return s.split('\n').map((r) => r.substr(indent)).join('\n')
}