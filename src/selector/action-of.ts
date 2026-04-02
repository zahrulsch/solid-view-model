import { onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { Result } from "../core/result"
import { Action } from "../listenable"

export function actionOf<V extends object, K extends PickActionFrom<V>>(viewModel: V, key: K) {
    const action = viewModel[key] as Action<any, any>

    if (!(action instanceof Action)) {
        throw Error(`Property ${String(key)} is not an action`)
    }

    const [state, setState] = createStore(action.result)

    onMount(() => {
        function listener() {
            setState(action.result)
        }

        const unsubscribe = action.subscribe(listener)

        onCleanup(() => unsubscribe())
    })

    return state
}

export type PickActionFrom<V extends object> = keyof {
    [K in keyof V as V[K] extends Action<any, any> ? K : never]: V[K]
}

export type InferAction<V extends object, K extends PickActionFrom<V>> =
    V[K] extends Action<any, infer R, any, infer E> ? Result<R, E> : never
