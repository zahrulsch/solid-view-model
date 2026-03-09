import * as v from "valibot"
import { describe, expect, it } from "vitest"
import { param } from "../core"

const maybeInput = v.union([v.string(), v.null()])
const numberTransform = v.transform<string | null, number>((value) => {
    if (value === null) return 0
    const parsed = parseInt(value)
    return isNaN(parsed) ? 0 : parsed
})
const numberSchema = v.fallback(v.pipe(maybeInput, numberTransform, v.maxValue(100)), 0)

describe("Param navigasi testing", () => {
    it("testing navigasi dengan pushState", () => {
        const subject = param({
            page: {
                validate: v.parser(numberSchema),
            },
            anc: {
                validate: v.parser(numberSchema),
            },
        })

        expect(subject()).toEqual({ page: 0, anc: 0 })

        subject({ page: 5 })
        expect(subject()).toEqual({ page: 5, anc: 0 })
        expect(location.search).toEqual("?page=5")

        subject({ page: null })
        expect(subject()).toEqual({ page: 0, anc: 0 })
        expect(location.search).toEqual("")

        subject({ page: 10, anc: 20 })
        expect(subject()).toEqual({ page: 10, anc: 20 })
        expect(location.search).toEqual("?anc=20&page=10")

        subject({ page: undefined, anc: undefined })
        expect(subject()).toEqual({ page: 0, anc: 0 })
        expect(location.search).toEqual("")

        subject({ page: 200, anc: 300 })
        expect(subject()).toEqual({ page: 0, anc: 0 })
        expect(location.search).toEqual("")
    })
})
