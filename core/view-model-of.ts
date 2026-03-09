import { Core } from "./core"
import type { ViewModel } from "./view-model"

export function viewModelOf<T extends ViewModel>(viewModel: { new (): T }): T {
    const name = viewModel.name
    const box = Core.instance.viewModelBox

    if (!box.has(name)) {
        throw new Error(`ViewModel not found: ${name}`)
    }

    return box.get(name)
}
