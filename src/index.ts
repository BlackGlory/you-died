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

export default youDied
export function youDied(cleanup: ICleanup): ICancelCleanup {
  if (cleanups.size === 0) {
    install()
  }
  cleanups.defer(fn)

  return () => {
    cleanups.remove(fn)
    if (cleanups.size === 0) {
      uninstall()
    }
  }

  // 确保每一个cleanup都独一无二
  function fn() {
    cleanup()
  }
}

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

function install(): void {
  // 注意, 你可能想监听exit事件, 但该事件实际上是无法使用的:
  // 当调用process.exit(触发exit事件)时, Node.js内的许多功能会停止, 此时大部分代码已经无法正常执行.

  // 通过prepend来让事件监听器尽早被运行
  process.prependOnceListener('uncaughtException', exitGracefully)
  process.prependOnceListener('SIGINT', throwExitSignal)
  process.prependOnceListener('SIGTERM', throwExitSignal)
  process.prependOnceListener('SIGBREAK', throwExitSignal)
}

function uninstall(): void {
  process.removeListener('uncaughtException', exitGracefully)
  process.removeListener('SIGINT', throwExitSignal)
  process.removeListener('SIGTERM', throwExitSignal)
  process.prependOnceListener('SIGBREAK', throwExitSignal)
}
