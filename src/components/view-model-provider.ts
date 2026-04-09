import { useLocation, useNavigate } from "@solidjs/router"
import { createEffect, createRenderEffect, JSXElement, on, onCleanup, onMount } from "solid-js"
import { Core } from "../core/core"
import { isViewModel } from "../utils/is-view-model"

export type ViewModelProviderProps = {
    children?: JSXElement
    viewModel?: any
}

export function ViewModelProvider(props: ViewModelProviderProps) {
    const location = useLocation()
    const navigate = useNavigate()

    function registerViewModel(viewModel: any) {
        let name: string | undefined

        if (viewModel) {
            name = Object.getPrototypeOf(viewModel.constructor).name
        }

        if (name) {
            const unregister = Core.instance.registerViewModel(name, viewModel)

            onCleanup(() => {
                if (isViewModel(viewModel)) {
                    viewModel.dispose()
                }

                unregister()
            })
        }
    }

    createRenderEffect(() => {
        const viewModel = props.viewModel

        if (Array.isArray(viewModel)) {
            viewModel.forEach(registerViewModel)
        } else if (viewModel) {
            registerViewModel(viewModel)
        }
    })

    createEffect(
        on(
            () => [location.pathname, location.search, location.hash],
            () => Core.instance.changeSolidLocation(location),
            { defer: true }
        )
    )

    onMount(() => {
        Core.instance.addEventListener("navigate:string", navigate)
        Core.instance.addEventListener("navigate:number", navigate)

        onCleanup(() => {
            Core.instance.removeEventListener("navigate:string", navigate)
            Core.instance.removeEventListener("navigate:number", navigate)
        })
    })

    return props.children
}
