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
        expect(act.result.isIdle()).toBe(true)
    })

    it("check action execution, execute should be pending", () => {
        const act = action(mockFunc)
        expect(act.result.isIdle()).toBe(true)
        act.execute()
        expect(act.result.isPending()).toBe(true)
    })

    it("check action data polosan tanpa mapper", async () => {
        const act = action(mockFunc)
        expect(act.result.isIdle()).toBe(true)
        act.execute()
        expect(act.result.isPending()).toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.isSuccess()).toBe(true)
        expect(act.result.asData()).toBe("test")
    })

    it("check action error polosan tanpa mapper", async () => {
        const act = action(mockFuncError)
        expect(act.result.isIdle()).toBe(true)
        act.execute()
        expect(act.result.isPending()).toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.isFailure()).toBe(true)
        expect(act.result.asError().message).toBe("test error")
    })

    it("check action data dengan mapper", async () => {
        const act = action(mockFunc, {
            mapResult: (res) => res.toUpperCase(),
        })
        expect(act.result.isIdle()).toBe(true)
        act.execute()
        expect(act.result.isPending()).toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.isSuccess()).toBe(true)
        expect(act.result.asData()).toBe("TEST")
    })

    it("check action error dengan mapper", async () => {
        const act = action(mockFuncError, {
            mapError: (err) => new Error("Mapped: " + err.message),
        })
        expect(act.result.isIdle()).toBe(true)
        act.execute()
        expect(act.result.isPending()).toBe(true)

        await vi.runAllTimersAsync()

        expect(act.result.isFailure()).toBe(true)
        expect(act.result.asError().message).toBe("Mapped: test error")
    })
})
