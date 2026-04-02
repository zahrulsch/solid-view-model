import { Core } from "../core/core"
import { ViewModel } from "../core/view-model-type"
import { isViewModel } from "./is-view-model"

export function viewModelOf<T extends { new (...args: any[]): any }>(
    Class: T
): InstanceType<T> & ViewModel<InstanceType<T>> {
    const name = Object.getPrototypeOf(Class.prototype).constructor.name
    const instance = Core.instance.getViewModel(name)

    if (!instance) {
        throw new Error(`ViewModel ${name} is not registered.`)
    }

    if (!isViewModel(instance)) {
        throw new Error(`Instance of ${name} is not a ViewModel.`)
    }

    return instance as InstanceType<T> & ViewModel<InstanceType<T>>
}
