import { Action, Param, State, Store } from "../listenable"

export * from "./view-model.decorator"

export * from "./effect.decorator"

export type EffectMap = Record<string, Effect>

export type Unsubscribe = NoArgumentsFunction[]

export type Disposables = NoArgumentsFunction[]

export type Watchable = State<any> | Store<any> | Param<any>

export type GetListenable<T extends object> = {
    [K in keyof T as T[K] extends State<any> ? K : never]: K
} & {
    [K in keyof T as T[K] extends Store<any> ? K : never]: K
} & {
    [K in keyof T as T[K] extends Param<any> ? K : never]: K
} & {
    [K in keyof T as T[K] extends Action<any, any> ? K : never]: K
}

export type Effect = {
    fn: AnyFunction
    uniqueDeps: string[]
    immediate: boolean
}
