import { useLocation, useNavigate } from "@solidjs/router"
import { createEffect, createRenderEffect, on, onCleanup, type JSXElement } from "solid-js"
import type { ViewModel } from "../core"
import { Core } from "../core/core"

export interface ViewModelProviderProps<V extends ViewModel> {
    viewModel: V
    children?: JSXElement
}

export function ViewModelProvider<V extends ViewModel>(
    props: ViewModelProviderProps<V>
): JSXElement {
    const navigate = useNavigate()
    const location = useLocation()

    createRenderEffect(() => {
        const core = Core.instance
        const name = Object.getPrototypeOf(props.viewModel).constructor.name

        core.location.setNavigator(navigate)

        if (!core.viewModelBox.has(name)) {
            core.viewModelBox.set(name, props.viewModel)
            onCleanup(() => {
                core.viewModelBox.get(name).onDispose()
                core.viewModelBox.delete(name)
            })
        }
    })

    onCleanup(() => {
        Core.instance.location.resetLocation()
    })

    createEffect(
        on(
            () => JSON.stringify(location),
            () => {
                Core.instance.location.updateLocation(location)
            }
        )
    )

    return props.children
}
