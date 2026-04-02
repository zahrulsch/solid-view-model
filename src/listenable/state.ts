import type { LiteralToPrimitive, Primitive } from "type-fest"
import { Listenable } from "./listenable"

export class State<T extends Primitive> extends Listenable {
    protected _current: T
    protected _previous?: T

    constructor(value: T) {
        super()
        this._current = value
    }

    get current() {
        return this._current
    }

    get previous() {
        return this._previous
    }

    set current(value: T) {
        if (value === this._current) {
            return
        }

        this._previous = this._current
        this._current = value
        this.emit()
    }
}

export function state<T extends Primitive>(value: T): State<LiteralToPrimitive<T>>

export function state<T extends Primitive>(value?: T): State<LiteralToPrimitive<T | undefined>>

export function state<T extends Primitive>(value?: T) {
    return new State(value as T)
}
