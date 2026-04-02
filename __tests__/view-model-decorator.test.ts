// @ts-nocheck
import { expect, it, vi } from "vitest"
import { effect, viewmodel } from "../src/decorators"
import { state } from "../src/listenable"

const spyFunction = vi.fn()

@viewmodel
class TestViewModel {
    counter = state(0)

    @effect.lazy("counter")
    lazyAction(counter: number) {}

    @effect.immediate("counter", "counter")
    immediateAction(counter: number) {}

    @effect.disposable
    clearUserData() {
        spyFunction()
    }

    @effect.disposable
    disableTracking() {
        spyFunction()
    }
}

const suspect = new TestViewModel()

it("should be able to create a view model", () => {
    expect(suspect).toHaveProperty("dispose")
    expect(suspect).toHaveProperty("stateOf")
    expect(suspect).toHaveProperty("storeOf")
    expect(suspect).toHaveProperty("paramOf")
    expect(suspect).toHaveProperty("__effects__")
    expect(suspect).toHaveProperty("__unsubscribe__")
    expect(suspect).toHaveProperty("__disposables__")
})

it("check if the view model has disposables", () => {
    expect(suspect["__disposables__"].length).toBe(2)
    suspect.dispose()
    expect(spyFunction).toHaveBeenCalledTimes(2)
})

it("check if the view model has effects", () => {
    expect(suspect["__effects__"]).toEqual({
        lazyAction: {
            immediate: false,
            uniqueDeps: ["counter"],
            fn: expect.any(Function),
        },
        immediateAction: {
            immediate: true,
            uniqueDeps: ["counter"],
            fn: expect.any(Function),
        },
    })

    expect(suspect["__unsubscribe__"].length).toBe(2)
})
