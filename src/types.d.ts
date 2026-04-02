declare type AnyFunction = (...args: any[]) => any
declare type NoArgumentsFunction = () => any

declare interface NavigateOptions<S = unknown> {
    resolve: boolean
    replace: boolean
    scroll: boolean
    state: S
}

declare interface SolidNavigator {
    (to: string, options?: Partial<NavigateOptions>): void
    (delta: number): void
}

declare interface Path {
    pathname: string
    search: string
    hash: string
}

declare interface SolidLocation<S = unknown> extends Path {
    query: Record<string, string | string[] | undefined>
    state: Readonly<Partial<S>> | null
    key: string
}
