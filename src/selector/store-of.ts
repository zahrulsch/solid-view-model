import { isEqual } from "es-toolkit"
import { onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { Store } from "../listenable"

export function storeOf<V extends object, K extends PickStoreFrom<V>>(viewModel: V, target: K) {
    const targetState = viewModel[target] as Store<any>
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

export type PickStoreFrom<V extends object> = keyof {
    [K in keyof V as V[K] extends Store<any> ? K : never]: V[K]
}

export type InferStore<V extends object, K extends PickStoreFrom<V>> = V[K] extends Store<infer R>
    ? R
    : never

export type StoreOf<V extends object> = (
    viewModel: V,
    target: PickStoreFrom<V>
) => InferStore<V, PickStoreFrom<V>>
