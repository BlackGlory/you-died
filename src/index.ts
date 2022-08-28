import { Awaitable } from 'justypes'
import { Destructor } from 'extra-defer'
import { isExitSignal, throwExitSignal } from './exit-signal'

type ICleanup = () => Awaitable<void>
type ICancelCleanup = () => void

enum ExitCode {
  Success = 0
, Failure = 1
}

const cleanups = new Destructor()
process.once('uncaughtException', exitGracefully)
process.once('SIGINT', throwExitSignal)
process.once('SIGTERM', throwExitSignal)
// 无法监听exit事件:
// exit有特殊性, 当调用process.exit时, Node.js内的很多功能会停止, 导致无法优雅退出.

export function youDied(cleanup: ICleanup): ICancelCleanup {
  cleanups.defer(fn)
  return () => cleanups.remove(fn)

  // 确保每一个cleanup都独一无二
  function fn() {
    cleanup()
  }
}

export default youDied

async function exitGracefully(err: Error): Promise<never> {
  if (isExitSignal(err)) {
    // SIGINT/SIGTERM引起的退出
    await cleanups.execute()
    process.exit(process.exitCode ?? ExitCode.Success)
  } else {
    // 不是SIGINT/SIGTERM引起的退出
    console.error(err)
    await cleanups.execute()
    process.exit(process.exitCode ?? ExitCode.Failure)
  }
}
