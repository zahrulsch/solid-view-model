import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { action } from "../src/listenable"
import { sleep } from "./utils/sleep"

describe("action", () => {
    const mockFunc = vi.fn((signal: AbortSignal) => async () => {
        await sleep(2000)
        return "test"
    })

    const mockFuncError = vi.fn((signal: AbortSignal) => async () => {
        await sleep(2000)
        throw new Error("test error")
    })

    beforeEach(() => vi.useFakeTimers())

    afterEach(() => vi.restoreAllMocks())

    it("check action execution, no execute should be idle", () => {
        const act = action(mockFunc)
        expect(act.result.type === "idle").toBe(true)
    })

    it("check action execution, execute should be pending", () => {
        const act = action(mockFunc)
        expect(act.result.type === "idle").toBe(true)
        act.execute()
        expect(act.result.type === "pending").toBe(true)
    })

    it("check action data polosan tanpa mapper", async () => {
        const act = action(mockFunc)
        expect(act.result.type === "idle").toBe(true)
        act.execute()
        expect(act.result.type === "pending").toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.type === "success").toBe(true)
        expect(act.result.value).toBe("test")
    })

    it("check action error polosan tanpa mapper", async () => {
        const act = action(mockFuncError)
        expect(act.result.type === "idle").toBe(true)
        act.execute()
        expect(act.result.type === "pending").toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.type === "failure").toBe(true)
        expect(act.result.error.message).toBe("test error")
    })

    it("check action data dengan mapper", async () => {
        const act = action(mockFunc, {
            mapResult: (res) => res.toUpperCase(),
        })
        expect(act.result.type === "idle").toBe(true)
        act.execute()
        expect(act.result.type === "pending").toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.type === "success").toBe(true)
        expect(act.result.value).toBe("TEST")
    })

    it("check action error dengan mapper", async () => {
        const act = action(mockFuncError, {
            mapError: (err) => new Error("Mapped: " + err.message),
        })
        expect(act.result.type === "idle").toBe(true)
        act.execute()
        expect(act.result.type === "pending").toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.type === "failure").toBe(true)
        expect(act.result.error.message).toBe("Mapped: test error")
    })
})
