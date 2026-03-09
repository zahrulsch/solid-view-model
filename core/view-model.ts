import type { Listenable } from "./listenable"
import { param, type ParamDefinition } from "./param"
import { selectListenable, type SelectorListenable } from "./select-listenable"
import { state, type State } from "./state"

type WatchableOptions<T extends Watchable<any> | Watchable<any>[]> = {
    immediate?: boolean
    isEqual?: T extends Watchable<any>[]
        ? (
              prev: { [K in keyof T]: UnwrapWatchable<T[K]> },
              current: { [K in keyof T]: UnwrapWatchable<T[K]> }
          ) => boolean
        : T extends Watchable<infer U>
          ? (prev: U, current: U) => boolean
          : never
}

type Watchable<T> = Listenable<T>

type UnwrapWatchable<W> = W extends Watchable<infer T> ? T : any

type WatchableListener<W extends Watchable<any> | Watchable<any>[]> = W extends Watchable<any>[]
    ? (...arg: { [K in keyof W]: UnwrapWatchable<W[K]> }) => void
    : W extends Watchable<infer T>
      ? (current: T) => void
      : never

export abstract class ViewModel {
    static state<T = undefined>(): State<T | undefined>
    static state<T>(initialValue: T): State<T>
    static state<T>(initialValue?: T) {
        return state(initialValue)
    }

    static param<P extends ParamDefinition>(definition: P) {
        return param(definition)
    }

    private _internalUnsubscribes: Set<VoidFunction> = new Set()

    public dispatch(_: any): void {}

    public onDispose(): void {
        this._internalUnsubscribes.forEach((unsubscribe) => unsubscribe())
        this._internalUnsubscribes.clear()
    }

    protected watch<const W extends Watchable<any> | Watchable<any>[]>(
        target: W,
        listener: WatchableListener<W>,
        options: WatchableOptions<W> = {
            immediate: false,
            isEqual: Object.is as any,
        }
    ): void {
        const self = this
        let previousValue: any = undefined

        function privateListener() {
            const value: any = Array.isArray(target)
                ? target.map((it) => it.currentValue)
                : [target.currentValue]

            if (options?.isEqual) {
                if (previousValue !== undefined && options.isEqual(previousValue, value)) {
                    return
                }
            }

            previousValue = value

            listener.apply(self, value)
        }

        if (options?.immediate) privateListener()

        const unsubscribes: VoidFunction[] = Array.isArray(target)
            ? target.map((it) => it.subscribe(privateListener, { immediate: false }))
            : [target.subscribe(privateListener, { immediate: false })]

        function privateUnsubscribe() {
            unsubscribes.forEach((unsubscribe) => unsubscribe())
        }

        self._internalUnsubscribes.add(privateUnsubscribe)
    }

    public select<R>(selector: SelectorListenable<this, Listenable<R>>) {
        return selectListenable(this, selector)
    }
}
