export type TResult<T, E = Error> =
    | {
          type: "success"
          value: T
      }
    | {
          type: "failure"
          error: E
      }
    | {
          type: "pending"
      }
    | {
          type: "retrying"
          value?: T | undefined
      }
    | {
          type: "idle"
      }

export class Result {
    static success<T, E = Error>(value: T): TResult<T, E> {
        return { type: "success", value }
    }

    static failure<T, E = Error>(error: E): TResult<T, E> {
        return { type: "failure", error }
    }

    static pending<T, E = Error>(): TResult<T, E> {
        return { type: "pending" }
    }

    static retrying<T, E = Error>(value?: T): TResult<T, E> {
        return { type: "retrying", value }
    }

    static idle<T, E = Error>(): TResult<T, E> {
        return { type: "idle" }
    }

    static isSuccess<T>(result: TResult<T>): result is Extract<TResult<T>, { type: "success" }> {
        return result.type === "success"
    }

    static isFailure<E>(
        result: TResult<any, E>
    ): result is Extract<TResult<any, E>, { type: "failure" }> {
        return result.type === "failure"
    }

    static isPending(result: TResult<any>): result is Extract<TResult<any>, { type: "pending" }> {
        return result.type === "pending"
    }

    static isRetrying<T>(result: TResult<T>): result is Extract<TResult<T>, { type: "retrying" }> {
        return result.type === "retrying"
    }

    static isIdle(result: TResult<any>): result is Extract<TResult<any>, { type: "idle" }> {
        return result.type === "idle"
    }
}
