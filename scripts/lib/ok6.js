export default function ok6() {
	return {
		ok,
		not,
		x,
		fails,
		type,
		eq,
		error,
	}
}

ok6Test()

function error(msg, ErrorClass = Error) { throw new ErrorClass(msg) }
function ok(b, msg = 'ok() failed') { if (b) { return ok } error(`NOT ok: ${msg}\n`) }
function not(b, msg = 'not() failed') { if (!b) { return not } error(`NOT not: ${msg}\n`) }
function fails(fn = () => null) {
	const that = null
	try { fn.apply(that, []) } catch (err) { return err }
	error(`fails() Did NOT fail\n executing function:\n${fn} `)
}

function x(v, typeSpec) {
	if (type(v, typeSpec, 'use as predicate')) return v
	error(`x (v, typeSpec) called with\nv === ${v}\ntypeSpec === ${format()}`)

	function format(typeSpec) {
		if (typeof typeSpec === 'string') return `"${typeSpec}"`
		if (typeof typeSpec === 'function') return typeSpec.name
		return JSON.stringify(typeSpec, null, ' ')
	}
}

function type(v, typeSpec, neverThrow) {
	if (checkType(v, typeSpec)) return type
	if (neverThrow) return false
	throw new Error('type(...) failed')

	function checkType(v, typeSpec) {
		if (Array.isArray(typeSpec)) {
			// SUM-TYPE: valid if any spec passes
			if (typeSpec.length > 1) return typeSpec.some(spec => checkType(v, spec))

			// TYPED ARRAY: check array elements
			if (!Array.isArray(v)) return false
			if (v.length === 0) return true
			const specElem = typeSpec[0]
			const sample = v.length > 5 ? [...v.slice(0, 5), v[v.length - 1]] : v
			return sample.every(item => checkType(item, specElem))
		}

		// Handle null values
		if (v === null) return typeSpec === null || typeSpec === 'object'
		if (typeSpec === null) return false

		// Handle undefined typeSpec
		if (typeSpec === undefined) {
			if (v === undefined || v === null) return false
			return v.constructor === undefined
		}

		// Basic type check
		if (typeof v === typeSpec) return true
		return v.constructor === typeSpec || (typeof typeSpec === 'function' && v instanceof typeSpec)
	}
}

function eq(a, b, predicateMode = false) {
	const msg = eqMessage(a, b)
	if (!msg) return predicateMode ? true : eq
	if (predicateMode) return false
	throw new Error(msg)
}

function eqMessage(a, b) {
	if (arguments.length !== 2) return 'eq() called with !== 2 arguments'
	if (a === b) return ''
	if (a == null || b == null) return `eq() ${a} !== ${b}`
	if (a.constructor !== b.constructor) return `eq(a,b): a.constructor === ${a.constructor.name} but b.constructor === ${b.constructor.name}`

	if (Array.isArray(a)) {
		const maxLength = Math.max(a.length, b.length)
		for (let j = 0; j < maxLength; j++) {
			const m = eqMessage(a[j], b[j])
			if (m) return m
		}
		return a.length === b.length ? '' : 'eq(): array lengths differ'
	}

	if (typeof a === 'object') {
		for (const key in a) {
			const m = eqMessage(a[key], b[key])
			if (m) return m
		}
		for (const key in b) {
			const m = eqMessage(a[key], b[key])
			if (m) return m
		}
		return ''
	}

	return `not (eq (${JSON.stringify(a)}, ${JSON.stringify(b)}))`
}

export function ok6Test() {
	const { ok, not, x, fails, type, eq, error } = ok6()

	// Basic assertions
	ok(ok)
	ok(not)
	not(1 instanceof Number)

	ok(x(123, Number) === 123)
	fails(() => x(123, String))

	ok(eq({ x: [1, [2]] }, { x: [1, [2]] }))
	not(eq({ x: [1, [2]] }, { x: [1, [7]] }, true))

	ok(1)
	fails((_) => ok(0))

	ok(ok(1) === ok)
	ok(1)(5 < 7)(23 * 46 === 1058)

	let testValue = -1
	fails(() => ok(testValue > 0, 'testValue > 0'))
	ok(fails(() => ok(testValue > 0, 'testValue > 0')).message === 'NOT ok: testValue > 0\n')

	not(0)
	fails((_) => not(1))
	not([] === [])
	not({} === {})

	ok(not(0) === not)
	not(1 > 2)(23 * 46 === 0)(0)(false)('')

	testValue = -1
	fails(() => not(testValue < 0, 'testValue < 0'))
	ok(fails(() => not(testValue < 0, 'testValue < 0')).message === 'NOT not: testValue < 0\n')

	let n = 3
	ok(type(n, Number) === type)
	type(n, Number)(n, 'number')('n', String)

	ok(type(null, null))
	ok(type(123, [String, Number]))
	ok(type('abc', [String, Number]))
	fails(() => type('abc', [Number]))
	fails(() => type({}, [String, Number]))

	type(123, Number)
	fails(() => type(123, String))
	ok(type(null, [String, null]))
	fails(() => type(123, [String, null]))
	not(type(123, [String, null], true))

	ok(type(null, [String, null]))
	not(type(null, String, 1))

	ok(type(123, 'number') === type)
	ok(type(123, Number) === type)
	ok(type(123, String, 1) === false)
	not(type(123, undefined, 1))
	not(type(undefined, undefined, 1))

	ok(type(undefined, 'undefined') === type)
	ok(type(null, 'object') === type)
	ok(type(null, null) === type)

	ok(type(undefined, undefined, 1) === false)
	ok(typeof undefined !== undefined)

	ok(type(undefined, null, 1) === false)
	ok(typeof undefined !== null)

	ok(type(null, undefined, 1) === false)
	ok(typeof null !== undefined)

	ok(type(null, null, 1) === type)
	ok(type(Object.create(null), undefined))
	ok(type(Object.create(null)))
	ok(Object.create(null).constructor === undefined)

	ok(type(['abc'], [String]))
	ok(type([], [String]))
	not(type([5], [String], 1))
	ok(type([], [String]))
	ok(type(['a'], [String]))
	ok(type(['a', 'b'], [String]))
	not(type(['a', 5], [String], 1))

	ok(x(null, null) === null)
	ok(x(123, Number) === 123)
	ok(x(123, 'number') === 123)

	fails(() => x(123, String))
	not(type(123, String, 1))

	fails(() => x(123))
	not(type(123, undefined, 1))

	fails(() => x(null))
	fails(() => x(undefined))
	x(null, [String, null])
	fails(() => x(null, String))

	x(['abc'], [String])
	x([], [String])
	fails(() => x([5], [String]))

	eq(1, 1)([], [])({}, {})
	ok(eq(1, 1))
	ok(eq([[1]], [[1]]))
	ok(eq({ x: 1 }, { x: 1 }))
	ok(eq({ x: [1, [2]] }, { x: [1, [2]] }))

	not(eq(1, 2, 1))
	fails((error) => eq(1, 2))
	not(eq([[1]], [[2]], 'truthy'))
	not(eq({ x: 1 }, { x: 2 }, 'truthy'))
	not(eq([[1]], [[2]], 'truthy'))
	not(eq({ x: 1 }, { x: [2] }, 'truthy'))
	fails((error) => eq(1, 2))

	fails((_) => ok.noSuchMethod())
	ok(fails((_) => 'abc'.noSuchMethod()) instanceof Error)

	const e2 = fails((e) => eq({ x: [1, [2]] }, { x: [1, [7]] }))
	ok(e2.message === 'not (eq (2, 7))')
	fails((_) => fails(() => 1))
	fails(() => error('some error-message'))
	x(fails(() => error('some error-message')), Error)

	fails(() => error('some error-message'))

	type(1, Number)('s', String)(true, Boolean)({}, Object)([], Array)(ok, Function)(new Error(), Error)

	console.log('ok6 tests done')
}
