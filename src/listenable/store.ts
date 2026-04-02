import { isEqual } from "es-toolkit/predicate"
import { create, Draft } from "mutative"
import { Listenable } from "./listenable"

export type Updater<T extends object> = (current: T) => T

export type SmartUpdater<T extends object> = (current: Draft<T>) => void

export class Store<T extends object> extends Listenable {
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

    update(value: T | Updater<T>) {
        const next = typeof value === "function" ? value(this._current) : value

        if (!isEqual(next, this._current)) {
            this._previous = this._current
            this._current = next
            this.emit()
        }
    }

    smartUpdate(updater: SmartUpdater<T>) {
        const next = create(this._current, (draft) => void updater(draft))

        if (!isEqual(next, this._current)) {
            this._previous = this._current
            this._current = next
            this.emit()
        }
    }
}

export function store<T extends object>(value: T): Store<T> {
    return new Store(value)
}
