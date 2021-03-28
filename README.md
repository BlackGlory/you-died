# you-died

Decently exit your Node.js application when it is interrupted.

## Motivation

I need to do an asynchronous cleanup action on exit, none of the modules worked for me:
- exit-hook
- async-exit-hook
- death
- node-cleanup

So I tried it myself, and finally found this:
```ts
process.once('uncaughtException', async () => {
  await cleanup()

  process.exit(0)
})

process.once('SIGINT', () => { throw new Error() })
```

## Install

```sh
npm install --save you-died
# or
yarn add you-died
```

## Usage

```ts
import youDied from 'you-died'
// or whatever name you feel is decent.

const cancel1 = youDied(async () => {
  await cleanup1()
})

const cancel2 = youDied(async () => {
  await cleanup2()
})
```

## Under the hood

This module listens to these events:
- `uncaughtException`
- `SIGINT`
- `SIGTERM`

POSIX signal events will throw an error named `Signal`,
which is caught by the `uncaughtException` handler function.

## API

### youDied

```ts
function youDied(cleanup: () => void | PromiseLike<void>): () => void
```

You can call this function multiple times,
and the `cleanup` function will run sequentially.
