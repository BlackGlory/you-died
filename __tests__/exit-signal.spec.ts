import { ExitSignal, isExitSignal, throwExitSignal } from '@src/exit-signal'
import { getError } from 'return-style'

test('ExitSignal', () => {
  new ExitSignal()
})

describe('isExitSignal', () => {
  test('ExitSignal', () => {
    const signal = new ExitSignal()

    const result = isExitSignal(signal)

    expect(result).toBe(true)
  })

  test('not ExitSignal', () => {
    const signal = new Error()

    const result = isExitSignal(signal)

    expect(result).toBe(false)
  })
})

test('throwExitSignal', () => {
  const err = getError(() => throwExitSignal())

  expect(err).toBeInstanceOf(ExitSignal)
})
