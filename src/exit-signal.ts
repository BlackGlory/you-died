import { CustomError } from '@blackglory/errors'

export class ExitSignal extends CustomError {}

export function throwExitSignal(): never {
  throw new ExitSignal()
}

export function isExitSignal(val: unknown): val is ExitSignal {
  return val instanceof ExitSignal
}
