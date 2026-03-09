import { create, type Draft, type DraftedObject } from "mutative"
import { Listenable } from "./listenable"

export interface State<T> {
    (setFunction: (value: T) => T): void
    smartSet: T extends object ? (setFunction: (value: Draft<T>) => void) => void : never
}

export interface State<T> {
    (): T
    (value: T): void
}

export class State<T> extends Listenable<T> {
    private _value: T
    private _previousValue: T | undefined

    constructor(initialValue: T) {
        super()
        this._value = initialValue

        const self = this

        function proxied(): T | void {
            if (arguments.length === 0) return self._value

            const arg = arguments[0]

            if (typeof arg === "function") {
                const setFunction = arg as (value: T) => T
                const newValue = setFunction(self._value)

                if (self._value === newValue) return

                self._previousValue = self._value
                self._value = newValue

                return self.emit()
            }

            if (self._value === arg) return

            self._previousValue = self._value
            self._value = arg

            return self.emit()
        }

        Object.setPrototypeOf(proxied, self)

        if (typeof initialValue === "object" && initialValue !== null) {
            Object.defineProperty(proxied, "smartSet", {
                get() {
                    return function (setFunction: (value: DraftedObject<T>) => void) {
                        const newValue = create(self._value, (draft) => setFunction(draft as any))

                        if (self._value === newValue) return

                        self._previousValue = self._value
                        self._value = newValue

                        self.emit()
                    }
                },
            })
        }

        return proxied as unknown as State<T>
    }

    get currentValue(): T {
        return this._value
    }

    get previousValue(): T | undefined {
        return this._previousValue
    }
}

export function state<T = undefined>(): State<T | undefined>

export function state<T>(initialValue: T): State<T>

export function state<T>(initialValue?: T) {
    return new State(initialValue)
}
