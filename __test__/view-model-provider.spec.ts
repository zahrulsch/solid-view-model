import { describe, expect, it } from "vitest"
import { navigate } from "../test-utils/navigate"

describe("ViewModelProvider", () => {
    it("test navigate", () => {
        navigate("/test-url")
        expect(window.location.pathname).toBe("/test-url")
    })
})
