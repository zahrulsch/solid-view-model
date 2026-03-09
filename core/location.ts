import type { Listenable } from "./listenable"

export class Location {
    private _navigator?: Navigator

    constructor(private _emitable: Listenable<any>) {}

    public current: URL = new URL(location.href)

    public navigate(to: string, options?: Partial<NavigateOptions>): void

    public navigate(delta: number): void

    public navigate(arg0: string | number, arg1?: Partial<NavigateOptions>): void {
        if (typeof arg0 === "string") {
            arg0 = arg0.replace(/^https?:\/\/[^\/]+/, "")
            this.current.href = location.origin + arg0

            if (this._navigator) {
                this._navigator(arg0, arg1)
            } else {
                window.history.pushState(null, "", arg0)
            }
        }

        if (typeof arg0 === "number" && this._navigator) {
            this._navigator(arg0)
        }

        this._emitable.emit()
    }

    public updateLocation({ hash, pathname, search }: SolidLocation) {
        const current = this.current

        const pairs = [
            ["pathname", current.pathname, pathname],
            ["search", current.search, search],
            ["hash", current.hash, hash],
        ] as const

        const diffs = pairs.filter(([_, current, next]) => !Object.is(current, next))

        if (diffs.length) {
            for (const [key, , next] of diffs) {
                current[key] = next
            }

            this._emitable.emit()
        }
    }

    public resetLocation() {
        this.current = new URL(location.origin)
    }

    public setNavigator(navigator: Navigator) {
        this._navigator = navigator
    }

    public get navigator(): Navigator | undefined {
        return this._navigator
    }
}

export type PushState = typeof history.pushState

export interface NavigateOptions<S = unknown> {
    resolve: boolean
    replace: boolean
    scroll: boolean
    state: S
}

export interface Navigator {
    (to: string, options?: Partial<NavigateOptions>): void
    (delta: number): void
}

export interface Path {
    pathname: string
    search: string
    hash: string
}

export interface SolidLocation<S = unknown> extends Path {
    query: Record<string, string | string[] | undefined>
    state: Readonly<Partial<S>> | null
    key: string
}
