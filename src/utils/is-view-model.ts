import { ViewModel } from "../core/view-model-type"

export function isViewModel(object: any): object is ViewModel<typeof object> {
    if (typeof object !== "object" || object === null) return false
    return ["dispose", "stateOf", "storeOf"].every((method) => typeof object[method] === "function")
}
