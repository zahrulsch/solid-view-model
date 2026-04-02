import { expect, it } from "vitest"
import { store } from "../src/listenable"

it("should be able to create a store", () => {
    const s = store({ count: 0 })
    expect(s.current).toEqual({ count: 0 })
})

it("should be able to update the store", () => {
    const s = store({ count: 0 })
    s.update({ count: 1 })
    expect(s.current).toEqual({ count: 1 })
    expect(s.previous).toEqual({ count: 0 })
})

it("should be able to smart update the store", () => {
    const s = store({ count: 0 })
    s.smartUpdate((state) => {
        state.count++
    })
    expect(s.current).toEqual({ count: 1 })
    expect(s.previous).toEqual({ count: 0 })
})

it("should not emit when updating with the same value", () => {
    const s = store({ count: 0 })
    let count = 0
    s.subscribe(() => count++)
    s.update({ count: 0 })
    expect(count).toBe(0)
})

it("should emit when updating with a different value", () => {
    const s = store({ count: 0 })
    let count = 0
    s.subscribe(() => count++)
    s.update({ count: 1 })
    expect(count).toBe(1)
})

it("should not emit when smart updating with the same value", () => {
    const s = store({ count: 0 })
    let count = 0
    s.subscribe(() => count++)
    s.smartUpdate((state) => {
        state.count = 0
    })
    expect(count).toBe(0)
})

it("should emit when smart updating with a different value", () => {
    const s = store({ count: 0 })
    let count = 0
    s.subscribe(() => count++)
    s.smartUpdate((state) => {
        state.count = 1
    })
    expect(count).toBe(1)
})
