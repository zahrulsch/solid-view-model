import { isEqual } from "es-toolkit/predicate"

export type CoreEvent = {
    "navigate:string"(to: string, options?: Partial<NavigateOptions>): void
    "navigate:number"(delta: number): void
}

type EventListeners = [keyof CoreEvent, CoreEvent[keyof CoreEvent]][]
type SolidLocationListener = (solidLocation?: SolidLocation) => void
type EmitListeners = SolidLocationListener[]

export class Core {
    private static _instance?: Core

    public static get instance(): Core {
        if (!this._instance) {
            this._instance = new Core()
        }

        return this._instance
    }

    private emitListeners: EmitListeners = []
    private eventListeners: EventListeners = []
    private currentSolidLocation?: SolidLocation
    private viewModelBox = new Map<string, any>()

    public addEventListener<E extends CoreEvent, K extends keyof E>(key: K, listener: E[K]) {
        this.eventListeners.push([key as any, listener as any])
    }

    public removeEventListener<E extends CoreEvent, K extends keyof E>(key: K, listener: E[K]) {
        this.eventListeners = this.eventListeners.filter(([k, l]) => {
            return !(k === key && l === listener)
        })
    }

    public registerViewModel(name: string, viewmodel: any): VoidFunction {
        this.viewModelBox.set(name, viewmodel)
        return () => void this.viewModelBox.delete(name)
    }

    public getViewModel(name: string) {
        return this.viewModelBox.get(name)
    }

    public changeSolidLocation(solidLocation: SolidLocation) {
        if (!this.currentSolidLocation) {
            this.currentSolidLocation = Object.assign({}, solidLocation)
            return this.emitListeners.forEach((listener) => listener(this.currentSolidLocation))
        }

        if (!isEqual(solidLocation, this.currentSolidLocation)) {
            this.currentSolidLocation.pathname = solidLocation.pathname
            this.currentSolidLocation.search = solidLocation.search
            this.currentSolidLocation.hash = solidLocation.hash
            this.emitListeners.forEach((listener) => listener(this.currentSolidLocation))
        }
    }

    public subscribe(listener: SolidLocationListener) {
        if (!this.emitListeners.some((l) => l === listener)) {
            this.emitListeners.push(listener)
        }

        return () => {
            this.emitListeners = this.emitListeners.filter((l) => l !== listener)
        }
    }

    public navigate(to: string, options?: Partial<NavigateOptions>): void

    public navigate(delta: number): void

    public navigate(target: string | number, options?: Partial<NavigateOptions>) {
        if (typeof target === "string" && this.eventListeners.length === 0) {
            console.warn(
                "[Solid Navigator] No navigate:string event listener found. " +
                    "Make sure to add an event listener for navigate:string to handle string navigation."
            )

            window.history.pushState({}, "", target)

            return this.emitListeners.forEach((listener) => listener())
        }

        if (typeof target === "string") {
            const lastListener = this.eventListeners
                .filter(([key]) => key === "navigate:string")
                .slice(-1)[0]

            if (lastListener) {
                const listener = lastListener[1] as CoreEvent["navigate:string"]
                listener(target, options)
            }

            return
        }

        if (typeof target === "number") {
            const lastListener = this.eventListeners
                .filter(([key]) => key === "navigate:number")
                .slice(-1)[0]

            if (lastListener) {
                const listener = lastListener[1] as CoreEvent["navigate:number"]
                listener(target)
            }

            return
        }
    }
}
