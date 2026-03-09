import { Core } from "./core"
import { Listenable, type ListneableListener } from "./listenable"

export interface Param<P extends ParamDefinition> {
    (): ParamValues<P>
    (value: ParamSetValue<P>): void
}

export class Param<const P extends ParamDefinition> extends Listenable<ParamValues<P>> {
    private parsedValue: ParamValues<P>
    private defaultValue: ParamValues<P>
    private unsubscribe: VoidFunction
    // private url = new URL(location.href)

    constructor(private definition: P) {
        super()

        this.parsedValue = Object.assign({}, this.parseValue())
        this.defaultValue = Object.assign({}, this.parseValue({}))

        this.unsubscribe = Core.instance.subscribe(() => {
            this.parsedValue = this.parseValue()
            this.emit()
        })

        const self = this

        function proxied() {
            if (arguments.length === 0) return self.parsedValue

            const payload = arguments[0] as ParamSetValue<P>
            self.internalNavigation(payload)
        }

        Object.setPrototypeOf(proxied, self)

        return proxied as any as Param<P>
    }

    private internalNavigation(payload: ParamSetValue<P>) {
        if (payload == null || typeof payload !== "object") return

        const payloadReduced = Object.keys(payload).reduce(
            (temporary, key) => {
                const payloadValue = payload[key]
                const defaultValue = this.defaultValue[key]
                const fieldKey = this.definition[key]?.rename || key
                const validate = this.definition[key]?.validate

                if (payloadValue === defaultValue || payloadValue == null) {
                    temporary[fieldKey] = null
                    return temporary
                }

                const stringPayloadValue = String(payloadValue)

                if (validate) {
                    try {
                        const result = validate(stringPayloadValue)
                        temporary[fieldKey] = result === defaultValue ? null : String(result)
                    } catch (error) {
                        temporary[fieldKey] = stringPayloadValue
                    }

                    return temporary
                }

                temporary[fieldKey] = stringPayloadValue
                return temporary
            },
            {} as Record<string, string | null>
        )

        const url = Object.entries(payloadReduced)
            .sort(([a], [b]) => a.localeCompare(b))
            .reduce((temporary, [key, value]) => {
                value == null
                    ? temporary.searchParams.delete(key)
                    : temporary.searchParams.set(key, value)

                return temporary
            }, new URL(location.href))

        Core.instance.location.navigate(url.href)
    }

    private parseValue(
        // sp = Object.fromEntries(this.url.searchParams.entries())
        sp = Object.fromEntries(Core.instance.currentUrl.searchParams.entries())
    ): ParamValues<P> {
        const def = this.definition
        const result = {} as ParamValues<P>

        for (const key in def) {
            const field = def[key]
            const paramKey = field.rename || key
            const paramValue = sp[paramKey] ?? null

            result[key] = field.validate ? field.validate(paramValue) : (paramValue as any)
        }

        return result
    }

    override subscribe(
        listener: ListneableListener,
        options?: { immediate?: boolean }
    ): VoidFunction {
        const unsubscribe = super.subscribe(listener, { immediate: options?.immediate })

        return () => {
            this.unsubscribe()
            unsubscribe()
        }
    }

    override emit() {
        super.emit()
    }

    get currentValue(): ParamValues<P> {
        return this.parsedValue
    }

    get previousValue(): ParamValues<P> | undefined {
        return undefined
    }
}

export function param<P extends ParamDefinition>(definition: P) {
    return new Param(definition)
}

export type ParamField<R> = {
    rename?: string
    /**
     * @param value The value of the parameter from URL, it can be string or null (if the parameter is not present in URL)
     * @returns The validated value or throws an error if validation fails
     */
    validate?: (value?: string | null) => R
}

export type ParamDefinition = Record<string, ParamField<any>>

export type ParamValues<P extends ParamDefinition> = {
    [K in keyof P]: P[K] extends ParamField<infer R>
        ? unknown extends R
            ? string | null
            : R
        : never
} & {}

export type ParamSetValue<P extends ParamDefinition> = {
    [K in keyof P]?: P[K] extends ParamField<infer R>
        ? unknown extends R
            ? string | null | undefined
            : R | null
        : never
} & {}
