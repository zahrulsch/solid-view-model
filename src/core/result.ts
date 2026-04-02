export abstract class Result<T, E = Error> {
    abstract isSuccess(): this is Success<T, E>
    abstract isFailure(): this is Failure<T, E>
    abstract isPending(): this is Pending<T, E>
    abstract isRetrying(): this is Retrying<T, E>
    abstract isIdle(): this is Idle<T, E>

    abstract type: "success" | "failure" | "pending" | "retrying" | "idle"

    asData(): T {
        if (this.isSuccess()) return this.value
        throw new Error("Result is not a success")
    }

    asError(): E {
        if (this.isFailure()) return this.error
        throw new Error("Result is not a failure")
    }

    static success<T, E = Error>(value: T): Result<T, E> {
        return new Success(value)
    }

    static failure<T, E = Error>(error: E): Result<T, E> {
        return new Failure(error)
    }

    static pending<T, E = Error>(): Result<T, E> {
        return new Pending()
    }

    static retrying<T, E = Error>(value?: T): Result<T, E> {
        return new Retrying(value)
    }

    static idle<T, E = Error>(): Result<T, E> {
        return new Idle()
    }
}

export class Success<T = any, E = Error> extends Result<T, E> {
    constructor(public value: T) {
        super()
    }

    type: "success" = "success"

    isSuccess(): this is Success<T, E> {
        return true
    }

    isFailure(): this is Failure<T, E> {
        return false
    }

    isPending(): this is Pending<T, E> {
        return false
    }

    isRetrying(): this is Retrying<T, E> {
        return false
    }

    isIdle(): this is Idle<T, E> {
        return false
    }
}

export class Failure<T = any, E = Error> extends Result<T, E> {
    constructor(public error: E) {
        super()
    }

    type: "failure" = "failure"

    isSuccess(): this is Success<T, E> {
        return false
    }

    isFailure(): this is Failure<T, E> {
        return true
    }

    isPending(): this is Pending<T, E> {
        return false
    }

    isRetrying(): this is Retrying<T, E> {
        return false
    }

    isIdle(): this is Idle<T, E> {
        return false
    }
}

export class Pending<T = any, E = Error> extends Result<T, E> {
    constructor() {
        super()
    }

    type: "pending" = "pending"

    isSuccess(): this is Success<T, E> {
        return false
    }

    isFailure(): this is Failure<T, E> {
        return false
    }

    isPending(): this is Pending<T, E> {
        return true
    }

    isRetrying(): this is Retrying<T, E> {
        return false
    }

    isIdle(): this is Idle<T, E> {
        return false
    }
}

export class Retrying<T = any, E = Error> extends Result<T, E> {
    constructor(public value?: T) {
        super()
    }

    type: "retrying" = "retrying"

    isSuccess(): this is Success<T, E> {
        return false
    }

    isFailure(): this is Failure<T, E> {
        return false
    }

    isPending(): this is Pending<T, E> {
        return false
    }

    isRetrying(): this is Retrying<T, E> {
        return true
    }

    isIdle(): this is Idle<T, E> {
        return false
    }
}

export class Idle<T = any, E = Error> extends Result<T, E> {
    constructor() {
        super()
    }

    type: "idle" = "idle"

    isSuccess(): this is Success<T, E> {
        return false
    }

    isFailure(): this is Failure<T, E> {
        return false
    }

    isPending(): this is Pending<T, E> {
        return false
    }

    isRetrying(): this is Retrying<T, E> {
        return false
    }

    isIdle(): this is Idle<T, E> {
        return true
    }
}
