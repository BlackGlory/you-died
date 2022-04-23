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
// 无法监听exit事件, 因为exit有特殊性, 当调用process.exit时, Node.js内的很多功能会停止, 导致无法优雅退出.

function emitExitSignal() {
  throw new Signal()
}

async function exitGracefully(err: Error): Promise<never> {
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
