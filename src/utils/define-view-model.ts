import type { Constructor } from "type-fest"
import type { ViewModel } from "../core/view-model-type"
import { isViewModel } from "./is-view-model"

export function defineViewModel<T extends Constructor<any>>(
    Class: T,
    ...args: ConstructorParameters<T>
): InstanceType<T> & ViewModel<InstanceType<T>> {
    const instance = new Class(...args)

    if (!isViewModel(instance)) {
        throw new Error("The provided constructor does not implement the ViewModel interface.")
    }

    return instance as any
}
