import { test, assert, expect } from 'vitest'
import HyperPug from './hyperpug.js'

// Create an instance with a sample filter
const hp = new HyperPug({
	uppercase: (s) => s.toUpperCase(),
})

test('Basic tag', () => {
	expect(hp.parse('div Hello'))
		.toBe('<div>Hello</div>')
})

test('Basic tag with classes', () => {
	expect(hp.parse('div.red.bold Hello'))
		.toBe('<div class="red bold">Hello</div>')
})

test('Tag with an ID and plain text', () => {
	expect(hp.parse('span#myId This is a span'))
		.toBe('<span id="myId">This is a span</span>')
})

test('Tag with parentheses for attributes', () => {
	expect(hp.parse('a(href="https://example.com" class="link") Example'))
		.toBe('<a class="link" href="https://example.com">Example</a>')
})

test('Nested elements by indentation', () => {
	const input = `
ul
  li First
  li Second
`
	expect(hp.parse(input))
		.toBe('<ul><li>First</li><li>Second</li></ul>')
})

test('Multiline text block with indentation', () => {
	const input = `
div.
    This is line one
    This is line two
`
	const output = hp.parse(input)
	assert.strictEqual(output, '<div>This is line one\nThis is line two\n</div>')
})


test('Suffix ":" for inline nested block', () => {
	expect(hp.parse('span: strong Strong text'))
		.toBe('<span><strong>Strong text</strong></span>')
})

test('Filters (lines starting with a colon)', () => {
	expect(hp.parse(':uppercase\n  this should become uppercase'))
		.toBe('<div>THIS SHOULD BECOME UPPERCASE</div>')
})

test('Encoded content (escaping < and > within text)', () => {
	expect(hp.parse('div <script>'))
		.toBe('<div>&lt;script&gt;</div>')
})
