import { action, observable } from 'mobx'
import _Async from './Async'

export const Async = _Async

export function dependsOn(anything) { }

export function asyncAction(target, key, descriptor) {
  const original = descriptor.value

  const fnState = observable({
    pending: false,
    error  : undefined,
    result : undefined,
  })

  const actionWrapper = action(function () {
    fnState.pending = true
    fnState.error   = undefined
    fnState.result  = undefined

    Promise
      .resolve(original.apply(this, arguments))
      .then(
        (result) => {
          fnState.pending = false
          fnState.error   = undefined
          fnState.result  = result || true
        },
        (err) => {
          fnState.result  = undefined
          fnState.pending = false
          fnState.error   = err
        }
      )
  })

  descriptor.value = actionWrapper

  Object.defineProperty(actionWrapper, 'pending', {
    get: () => fnState.pending
  })

  Object.defineProperty(actionWrapper, 'error', {
    get: () => fnState.error
  })

  Object.defineProperty(actionWrapper, 'result', {
    get: () => fnState.result
  })

  return descriptor
}