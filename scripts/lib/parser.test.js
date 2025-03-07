import { test, expect } from 'vitest'
import { tokenize } from './parser.js'

test('Basic tag', () => {
	expect(tokenize('div Hello', { debug: true }))
		.toEqual(['div Hello', 'LINE_BREAK'])
})

test('Multiple lines without indentation', () => {
	expect(tokenize('div Hello\nspan World', { debug: true }))
		.toEqual(['div Hello', 'LINE_BREAK', 'span World', 'LINE_BREAK'])
})

test('Single indented line', () => {
	expect(tokenize('\tdiv Hello', { debug: true }))
		.toEqual(['INDENT', 'div Hello', 'LINE_BREAK'])
})

test('Multiple indentation levels', () => {
	expect(tokenize('div\n\tspan\n\t\tp', { debug: true }))
		.toEqual(['div', 'LINE_BREAK', 'INDENT', 'span', 'LINE_BREAK', 'INDENT', 'INDENT', 'p', 'LINE_BREAK'])
})

test('Handles empty lines correctly', () => {
	expect(tokenize('div\n\nspan', { debug: true }))
	.toEqual(['div', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK', 'span', 'LINE_BREAK'])
})

test('Handles trailing empty lines', () => {
	expect(tokenize('div\nspan\n\n', { debug: true }))
	.toEqual(['div', 'LINE_BREAK', 'span', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK'])
})

test('Handles multiple consecutive empty lines', () => {
	expect(tokenize('\n\ndiv\n\nspan\n\n', { debug: true }))
	.toEqual(['LINE_EMPTY', 'LINE_BREAK', 'div', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK', 'span', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK'])
})

test('Handles space indentation', () => {
	expect(tokenize('  div Hello', { debug: true }))
	.toEqual(['INDENT', 'div Hello', 'LINE_BREAK'])
})

test('Throws error on mixed indentation', () => {
	expect(() => tokenize('div\n\tspan\n  p', { debug: true }))
	.toThrow(/Mixed indentation detected/)
})

test('Handles only empty lines', () => {
	expect(tokenize('\n\n\n', { debug: true }))
	.toEqual(['LINE_EMPTY', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK'])
})

test('Handles lines with only whitespace', () => {
	expect(tokenize('div\n  \n\t\nspan', { debug: true }))
	.toEqual(['div', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK', 'LINE_EMPTY', 'LINE_BREAK', 'span', 'LINE_BREAK'])
})
