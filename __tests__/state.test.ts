import { expect, it } from "vitest"
import { state } from "../src/listenable"

it("should be able to create a state", () => {
    const s = state(0)
    expect(s.current).toBe(0)
    expect(s.previous).toBeUndefined()
})

it("should be able to update the state", () => {
    const s = state(0)
    s.current = 1
    expect(s.current).toBe(1)
    expect(s.previous).toBe(0)
})

it("should not emit when setting the same value", () => {
    const s = state(0)
    let count = 0
    s.subscribe(() => count++)
    s.current = 0
    expect(count).toBe(0)
})

it("should emit when setting a different value", () => {
    const s = state(0)
    let count = 0
    s.subscribe(() => count++)
    s.current = 1
    expect(count).toBe(1)
})
