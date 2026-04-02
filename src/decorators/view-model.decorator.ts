import type { Constructor } from "type-fest"
import type { Disposables, Effect, EffectMap, Unsubscribe } from "./index"

import { isEqual } from "es-toolkit/predicate"
import { Action, Param, State, Store } from "../listenable"
import { actionOf } from "../selector/action-of"
import { paramOf } from "../selector/param-of"
import { stateOf } from "../selector/state-of"
import { storeOf } from "../selector/store-of"

export function viewmodel<T extends Constructor<any>>(constructor: T): T {
    return class extends constructor {
        private __effects__: EffectMap = this["__effects__"] || {}
        private __unsubscribe__: Unsubscribe = this["__unsubscribe__"] || []
        private __disposables__: Disposables = this["__disposables__"] || []

        constructor(...args: any[]) {
            super(...args)
            this.registerEffects()
        }

        protected registerEffects() {
            for (const key in this.__effects__) {
                this.registerEffect(this.__effects__[key]!)
            }
        }

        protected registerEffect({ uniqueDeps, immediate, fn }: Effect) {
            const self = this
            const watchAbles = uniqueDeps
                .map((key) => self[key])
                .filter((it) => it instanceof State || it instanceof Store || it instanceof Param)

            let currentValues: any

            if (immediate) {
                const current = watchAbles.map((watchable) => watchable.current)
                fn.apply(self, current)
            }

            function listener() {
                const nextValues = watchAbles.map((l) => l.current)

                if (!isEqual(currentValues, nextValues)) {
                    fn.apply(self, nextValues)
                    currentValues = nextValues
                }
            }

            const unsubscribes = watchAbles.map((it) => it.subscribe(listener.bind(self)))

            function unsubscribe() {
                unsubscribes.forEach((unsubscribe) => unsubscribe())
            }

            this.__unsubscribe__.push(unsubscribe)
        }

        protected dispose() {
            for (const key in this) {
                const property: any = this[key]

                if (property instanceof Action) {
                    property.abort()
                }
            }

            this.__disposables__.forEach((dispose) => dispose())
            this.__unsubscribe__.forEach((unsubscribe) => unsubscribe())
        }

        protected stateOf(key: string) {
            return stateOf(this as any, key)
        }

        protected storeOf(key: string) {
            return storeOf(this as any, key)
        }

        protected paramOf(key: string) {
            return paramOf(this as any, key)
        }

        protected actionOf(key: string) {
            return actionOf(this as any, key)
        }
    }
}
