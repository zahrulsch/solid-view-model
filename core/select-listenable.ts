import { createSignal, onCleanup, onMount, type Accessor } from "solid-js"
import type { Listenable, ListenableOptions } from "./listenable"
import { ViewModel } from "./view-model"

export type LimitedViewModelScope<V extends ViewModel> = {
    [K in keyof V as V[K] extends Listenable<any> ? K : never]: V[K]
}

export type SelectorListenable<V extends ViewModel, K> = (viewModel: LimitedViewModelScope<V>) => K

export function selectListenable<V extends ViewModel, R>(
    viewModel: V,
    selector: SelectorListenable<V, Listenable<R>>,
    options: ListenableOptions<R> = { immediate: true, isEqual: Object.is }
): Accessor<R> {
    const listanable = selector(viewModel as any)
    const [currentState, setCurrentState] = createSignal<R>(listanable.currentValue)

    onMount(() => {
        const unsubscribe = listanable.subscribe(
            () => setCurrentState(() => listanable.currentValue),
            options
        )

        onCleanup(() => unsubscribe())
    })

    return currentState
}
