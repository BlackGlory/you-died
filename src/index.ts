import { series } from 'extra-promise'
import { CustomError } from '@blackglory/errors'

type ICleanup = () => void | PromiseLike<void>
type ICancel = () => void

const cleanups: Set<ICleanup> = new Set()

process.once('uncaughtException', exitGracefully)
process.once('SIGINT', emitExitSignal)
process.once('SIGTERM', emitExitSignal)

export default youDied
export function youDied(cleanup: ICleanup): ICancel {
  const fn = () => cleanup()

  cleanups.add(fn)

  return () => cleanups.delete(fn)
}

class Signal extends CustomError {}

function emitExitSignal() {
  throw new Signal()
}

async function exitGracefully(err: Error) {
  if (err instanceof Signal) console.error(err)

  await series(cleanups)

  process.exit(err instanceof Signal ? 0 : 1)
}
