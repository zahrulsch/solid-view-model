import { InferAction, PickActionFrom } from "../selector/action-of"
import { InferParam, PickParamFrom } from "../selector/param-of"
import { InferState, PickStateFrom } from "../selector/state-of"
import { InferStore, PickStoreFrom } from "../selector/store-of"

export interface ViewModel<T extends object> {
    dispose(): void

    stateOf<K extends PickStateFrom<T>>(key: K | (string & {})): { current: InferState<T, K> }

    storeOf<K extends PickStoreFrom<T>>(key: K | (string & {})): InferStore<T, K>

    paramOf<K extends PickParamFrom<T>>(key: K | (string & {})): InferParam<T, K>

    actionOf<K extends PickActionFrom<T>>(key: K | (string & {})): InferAction<T, K>
}
