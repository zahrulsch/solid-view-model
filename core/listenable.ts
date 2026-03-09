export type ListneableListener = () => void

export type ListenableOptions<T> = {
    immediate?: boolean
    isEqual?: (prev: T, current: T) => boolean
}

export abstract class Listenable<T> {
    abstract get currentValue(): T

    abstract get previousValue(): T | undefined

    private _listeners: Set<ListneableListener> = new Set()

    public subscribe(
        listener: ListneableListener,
        options: ListenableOptions<T> = { immediate: false, isEqual: Object.is }
    ): VoidFunction {
        if (!this._listeners.has(listener)) {
            this._listeners.add(listener)

            if (options.immediate) {
                listener()
            }
        }

        return () => this._listeners.delete(listener)
    }

    public emit(): void {
        for (const listener of this._listeners) {
            listener()
        }
    }

    public get listenerCount(): number {
        return this._listeners.size
    }
}
