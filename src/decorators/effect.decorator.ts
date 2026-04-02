import { uniq } from "es-toolkit"
import { GetListenable } from "."

export function lazy<T extends object, L extends keyof GetListenable<T> | (string & {})>(
    ...keys: L[]
) {
    return (target: T, key: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value

        if (typeof method !== "function") {
            throw Error("@lazy can only be applied to methods")
        }

        target.constructor.prototype.__effects__ = target.constructor.prototype.__effects__ || {}

        if (!target.constructor.prototype.__effects__[key]) {
            target.constructor.prototype.__effects__[key] = {
                fn: method,
                uniqueDeps: uniq(keys),
                immediate: false,
            }
        }
    }
}

export function immediate<T extends object, L extends keyof GetListenable<T> | (string & {})>(
    ...keys: L[]
) {
    return (target: T, key: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value

        if (typeof method !== "function") {
            throw Error("@immediate can only be applied to methods")
        }

        target.constructor.prototype.__effects__ = target.constructor.prototype.__effects__ || {}

        if (!target.constructor.prototype.__effects__[key]) {
            target.constructor.prototype.__effects__[key] = {
                fn: method,
                uniqueDeps: uniq(keys),
                immediate: true,
            }
        }
    }
}

export function disposable(target: any, _: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    if (typeof method !== "function") {
        throw Error("@disposable can only be applied to methods")
    }

    target.constructor.prototype.__disposables__ =
        target.constructor.prototype.__disposables__ || []

    if (!target.constructor.prototype.__disposables__.includes(method)) {
        target.constructor.prototype.__disposables__.push(method)
    }
}

export const effect = { lazy, immediate, disposable }
