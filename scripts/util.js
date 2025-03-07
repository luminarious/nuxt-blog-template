import dotProp from 'dot-prop-immutable'

export function dotPropPick(el, select) {
	let p = {}

	select.map((k) => {
		p = dotProp.set(p, k, dotProp.get(el, k))
	})

	return p
}

export function dotPropOmit(el, deSelect) {
	let p = el

	deSelect.map((k) => {
		p = dotProp.delete(el, k)
	})

	return p
}
