import { onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { State } from "../listenable"

export function stateOf<V extends object, K extends PickStateFrom<V>>(viewModel: V, target: K) {
    const targetState = viewModel[target] as State<any>
    const [localState, setLocalState] = createStore({ current: targetState.current })

    onMount(() => {
        function listener() {
            const nextValue = targetState.current

            if (localState.current !== nextValue) {
                setLocalState("current", nextValue)
            }
        }

        listener()

        const unsubscribe = targetState.subscribe(listener)

        onCleanup(() => unsubscribe())
    })

    return localState
}

export type PickStateFrom<V extends object> = keyof {
    [K in keyof V as V[K] extends State<any> ? K : never]: V[K]
}

export type InferState<V extends object, K extends PickStateFrom<V>> = V[K] extends State<infer R>
    ? R
    : never

export type StateOf<V extends object> = (
    viewModel: V,
    target: PickStateFrom<V>
) => { current: InferState<V, PickStateFrom<V>> }
