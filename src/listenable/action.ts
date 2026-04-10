import { Result, TResult } from "../core/result"
import { Listenable } from "./listenable"

export type ActionFunction<P extends any[], R> = (signal: AbortSignal) => (...args: P) => Promise<R>

export type ActionOptions<T = any, D = any, E = Error> = {
    signal?: AbortSignal

    onAbort?: () => void
    onError?: (error: any) => void
    onSuccess?: (result: any) => void
    onPending?: () => void

    mapError?: (error: Error) => E
    mapResult?: (result: T) => D
}

export class Action<P extends any[], R, D = R, E = Error> extends Listenable {
    private controller: AbortController = new AbortController()

    public result: TResult<D, E> = Result.idle()

    constructor(
        private func: ActionFunction<P, R>,
        private options: ActionOptions<R, D, E> = {}
    ) {
        super()
    }

    public abort() {
        this.controller.abort()
        if (this.options.onAbort) {
            this.options.onAbort()
        }
    }

    public isAborted() {
        return this.controller.signal.aborted
    }

    public execute(...args: P): void {
        if (!this.options.signal) {
            this.controller.abort()
            this.controller = new AbortController()
        }

        if (this.result.type === "success" || this.result.type === "retrying") {
            this.result = Result.retrying(this.result.value)
        } else {
            this.result = Result.pending()
            this.options.onPending?.()
        }

        this.emit()

        const actionFunc = this.func(this.options.signal || this.controller.signal)

        actionFunc(...args)
            .then((res) => {
                const data = this.options.mapResult ? this.options.mapResult(res) : (res as any)
                this.result = Result.success(data)
                this.options.onSuccess?.(data)
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return
                }

                const failure = this.options.mapError
                    ? this.options.mapError(err instanceof Error ? err : new Error(String(err)))
                    : (err as any)
                this.result = Result.failure(failure)
                this.options.onError?.(failure)
            })
            .finally(() => this.emit())
    }
}

export function action<P extends any[], R, D = R, E = Error>(
    func: ActionFunction<P, R>,
    options: ActionOptions<R, D, E> = {}
): Action<P, R, D, E> {
    return new Action(func, options)
}

/**
 * Penggunaan dalam ViewModel class
 *
 * @example
 *
 * const getDataAction = actionFunction(
 *    (signal) => async (param1: string, param2: number) => {
 *       const response = await fetch(`https://api.example.com/data?param1=${param1}&param2=${param2}`, { signal })
 *       const data = await response.json()
 *       return data
 *    }
 * )
 *
 * class MyViewModel {
 *     myAction = action(getDataAction)
 * }
 */
export function actionFunction<P extends any[], R>(
    func: ActionFunction<P, R>
): ActionFunction<P, R> {
    return func
}
