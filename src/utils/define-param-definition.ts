import { ParamDefinition } from "../listenable/param"

export function defineParamDefinition<D extends Record<string, ParamDefinition | true>>(
    definition: D
): D {
    return definition
}
