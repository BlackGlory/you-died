import { CustomError } from '@blackglory/errors'
import { Awaitable } from 'justypes'
import { Destructor } from 'extra-defer'

type ICleanup = () => Awaitable<void>
type ICancel = () => void

class Signal extends CustomError {}

const cleanups = new Destructor()

process.once('uncaughtException', exitGracefully)
process.once('SIGINT', emitExitSignal)
process.once('SIGTERM', emitExitSignal)
// 在uncaughtException里执行的process.exit不会再次发出exit事件, 所以不会意外调用emitExitSignal
process.once('exit', emitExitSignal)

function emitExitSignal() {
  throw new Signal()
}

async function exitGracefully(err: Error) {
  if (!(err instanceof Signal)) console.error(err)

  await cleanups.execute()

  process.exit(process.exitCode ?? (err instanceof Signal ? 0 : 1))
}

export default youDied
export function youDied(cleanup: ICleanup): ICancel {
  const fn = () => cleanup()

  cleanups.defer(fn)

  return () => cleanups.remove(fn)
}
