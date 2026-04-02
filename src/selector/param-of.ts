import { isEqual } from "es-toolkit"
import { onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { Param, ParamDeserialized } from "../listenable"

export function paramOf<V extends object, K extends PickParamFrom<V>>(viewModel: V, target: K) {
    const targetState = viewModel[target] as Param<any>
    const [localState, setLocalState] = createStore(Object.assign({}, targetState.current))

    onMount(() => {
        function listener() {
            const nextValue = targetState.current

            if (!isEqual(localState, nextValue)) {
                setLocalState(nextValue)
            }
        }

        listener()

        const unsubscribe = targetState.subscribe(listener)

        onCleanup(() => unsubscribe())
    })

    return localState
}

export type PickParamFrom<V extends object> = keyof {
    [K in keyof V as V[K] extends Param<any> ? K : never]: V[K]
}

export type InferParam<V extends object, K extends PickParamFrom<V>> = V[K] extends Param<infer R>
    ? ParamDeserialized<R>
    : never

export type ParamOf<V extends object> = (
    viewModel: V,
    target: PickParamFrom<V>
) => InferParam<V, PickParamFrom<V>>
