import { afterEach, describe, expect, it, vi } from "vitest"
import { state } from "../core/state"

vi.mock("../core/state.ts", { spy: true })

describe("State class testing", () => {
    afterEach(() => vi.clearAllMocks())

    it("checking setter getter", () => {
        const counter = state(0)

        expect(counter()).toBe(0)

        counter(() => 5)
        expect(counter.previousValue).toBe(0)
        expect(counter()).toBe(5)

        counter(8)
        expect(counter()).toBe(8)
    })

    it("testing dengan tipe data primitive", () => {
        const counter = state(0)
        expect(counter.smartSet).toBe(undefined)

        let counterValue = 0
        const listener = vi.fn(() => {
            counterValue = counter()
        })

        counter.subscribe(listener)

        for (let i = 0; i < 5; i++) {
            counter(9)
            counter(9)
            counter(9)
            counter(() => 9)
        }

        expect(counterValue).toBe(9)

        // jika nilai yang di-set sama dengan nilai sebelumnya, maka tidak akan emit
        expect(listener).toHaveBeenCalledTimes(1)
        expect(counter.emit).toHaveBeenCalledTimes(1)

        counter(() => 10)
        expect(counterValue).toBe(10)
        expect(listener).toHaveBeenCalledTimes(2)
        expect(counter.emit).toHaveBeenCalledTimes(2)
    })

    it("testing dengan tipe data non primitive", () => {
        const myState = state({ value: 0 })
        const listener = vi.fn()

        myState.subscribe(listener)

        expect(myState.smartSet).not.toBe(undefined)
        expect(myState.smartSet).instanceOf(Function)

        myState((draft) => ({
            ...draft,
            value: 5,
        }))

        expect(listener).toHaveBeenCalledTimes(1)
        expect(myState().value).toBe(5)

        myState.smartSet((draft) => {
            draft.value = 10
        })

        expect(listener).toHaveBeenCalledTimes(2)
        expect(myState().value).toBe(10)

        myState.smartSet((draft) => {
            draft.value = 10
        })
        // tetap tidak emit karena nilai yang di-set sama dengan nilai sebelumnya
        expect(listener).toHaveBeenCalledTimes(2)
    })
})
