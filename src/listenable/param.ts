import { create } from "mutative"
import { Core } from "../core/core"
import { Listenable } from "./listenable"

export type ParamDefinition<V = any> = {
    key?: string
    transform?: (value: string | null) => V
}

type InferField<D extends ParamDefinition | true> = D extends {
    transform: (value: string | null) => infer V
}
    ? V
    : string | undefined

type UpdateArgument<D extends Record<string, ParamDefinition | true>> = {
    [K in keyof D]?: InferField<D[K]> | null | string
}

export type ParamDeserialized<D extends Record<string, ParamDefinition | true>> = {
    [K in keyof D]: InferField<D[K]>
} & {}

export class Param<D extends Record<string, ParamDefinition | true>> extends Listenable {
    private unsubscribe: () => void
    private _current: ParamDeserialized<D>
    private _default: ParamDeserialized<D>

    constructor(private definition: D) {
        super()
        this.unsubscribe = this.subscribing()
        this._current = this.deserialize()
        this._default = this.deserialize("")
    }

    override subscribe(listener: NoArgumentsFunction): () => undefined {
        const unsubscribe = super.subscribe(listener)

        return () => {
            unsubscribe()

            if (this.listeners.size === 0) {
                this.unsubscribe()
            }
        }
    }

    private subscribing() {
        const listener = (solidLocation?: SolidLocation) => {
            this._current = this.deserialize(solidLocation?.search || window.location.search)
        }

        return Core.instance.subscribe(listener)
    }

    private deserialize(search: string = window.location.search): ParamDeserialized<D> {
        const params = new URLSearchParams(search)
        const result: Partial<ParamDeserialized<D>> = {}

        for (const key in this.definition) {
            const { key: paramKey, transform } =
                typeof this.definition[key] == "boolean"
                    ? {}
                    : (this.definition[key] as ParamDefinition)

            const keyToExtract = paramKey || key
            const extracted = params.get(keyToExtract)

            result[key] = transform ? transform(extracted) : (extracted ?? undefined)
        }

        return result as ParamDeserialized<D>
    }

    public update(args: Partial<UpdateArgument<D>>) {
        for (const key in args) {
            const nextValue = args[key]

            if (nextValue == null) {
                this._current = create(this._current, (draft) => {
                    // @ts-ignore
                    draft[key] = this._default[key]
                }) as ParamDeserialized<D>

                continue
            }

            const definition = this.definition[key]
            const transform = typeof definition == "object" ? definition.transform : null

            if (transform) {
                const serialized = transform(`${nextValue}`)

                this._current = create(this._current, (draft) => {
                    // @ts-ignore
                    draft[key] = serialized
                }) as ParamDeserialized<D>

                continue
            }

            this._current = create(this._current, (draft) => {
                // @ts-ignore
                draft[key] = nextValue
            }) as ParamDeserialized<D>
        }

        this.emit()
    }

    public push(options: { sort?: boolean } = { sort: true }) {
        const searchParams = new URLSearchParams(location.search)

        for (const key in this._current) {
            const currentValue = this._current[key]
            const defaultValue = this._default[key]
            const keyToApply =
                typeof this.definition[key] == "object" ? this.definition[key].key || key : key

            if (currentValue === defaultValue) {
                searchParams.delete(keyToApply)
            } else {
                searchParams.set(keyToApply, `${currentValue}`)
            }
        }

        if (options.sort) {
            searchParams.sort()
        }

        const search = searchParams.toString()
        const newUrl = `${location.pathname}${search ? `?${search}` : ""}${location.hash}`

        Core.instance.navigate(newUrl)
    }

    public updateAndPush(
        args: Partial<UpdateArgument<D>>,
        options: { sort?: boolean } = { sort: true }
    ) {
        this.update(args)
        this.push(options)
    }

    get current() {
        return this._current
    }
}

export function param<D extends Record<string, ParamDefinition | true>>(definition: D) {
    return new Param(definition)
}
