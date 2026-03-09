import { renderHook } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"
import { state } from "../core/state"
import { ViewModel } from "../core/view-model"

vi.mock("../core/state.ts", { spy: true })

describe("BasicViewModel", () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it("testing fungsi select untuk get state di UI", () => {
        class V extends ViewModel {
            counter = state(0)

            override dispatch(): void {
                throw new Error("Method not implemented.")
            }
        }

        const vm = new V()

        const { result } = renderHook(() => vm.select((it) => it.counter))
        renderHook(() => vm.select((it) => it.counter))
        renderHook(() => vm.select((it) => it.counter))

        // subscribe 3 kali karena 3 renderHook di atas
        expect(vm.counter.subscribe).toHaveBeenCalledTimes(3)

        expect(result()).toBe(0)
        expect(vm.counter.emit).toHaveBeenCalledTimes(0)

        vm.counter(5)
        expect(vm.counter.emit).toHaveBeenCalledTimes(1)

        expect(result()).toBe(5)
    })

    it('testing method "watch" degan single "watchable" tanpa "immediate"', () => {
        const listener = vi.fn()

        class View extends ViewModel {
            counter = state(0)

            constructor() {
                super()
                this.watch(this.counter, listener)
            }
        }

        const view = new View()

        expect(listener).toHaveBeenCalledTimes(0)

        for (let i = 1; i <= 5; i++) {
            view.counter(10)
        }

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(10)
    })

    it('testing method "watch" dengan double "watchable" tanpa "immediate"', () => {
        const listener = vi.fn()

        class View extends ViewModel {
            counter = state(0)
            name = state<string>()

            constructor() {
                super()
                this.watch([this.counter, this.name], listener)
            }
        }

        const view = new View()

        expect(listener).toHaveBeenCalledTimes(0)

        for (let i = 1; i <= 5; i++) {
            view.counter(10)
        }

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(10, undefined)
    })

    it('testing method "watch" degan single "watchable" dengan "immediate"', () => {
        const listener = vi.fn()

        class View extends ViewModel {
            counter = state(0)

            constructor() {
                super()
                this.watch(this.counter, listener, { immediate: true })
            }
        }

        const view = new View()

        expect(listener.mock.contexts[0]).toBe(view)

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(0)

        for (let i = 1; i <= 5; i++) {
            view.counter(10)
        }

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(10)
    })

    it('testing method "watch" dengan double "watchable" dengan "immediate"', () => {
        const listener = vi.fn()

        class View extends ViewModel {
            counter = state(0)
            name = state<string>()

            constructor() {
                super()
                this.watch([this.counter, this.name], listener, { immediate: true })
            }
        }

        const view = new View()

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(0, undefined)

        for (let i = 1; i <= 5; i++) {
            view.counter(10)
        }

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(10, undefined)
    })
})
