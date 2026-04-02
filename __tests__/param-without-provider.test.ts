import { beforeEach, expect, it } from "vitest"
import { Core } from "../src/core/core"
import { param } from "../src/listenable/param"

import * as v from "valibot"
import { defineParamDefinition } from "../src/utils/define-param-definition"

beforeEach(() => Core.instance.navigate("/"))

it("without transform", async () => {
    const target = param({ page: true, limit: true })
    expect(target.current).toEqual({})
})

it("with transform", async () => {
    const target = param({
        page: { transform: (value) => parseInt(value ?? "1") },
        limit: { transform: (value) => parseInt(value ?? "10") },
    })

    expect(target.current).toEqual({ page: 1, limit: 10 })
})

it("with custom key", () => {
    const target = param({
        page: { key: "p", transform: (value) => parseInt(value ?? "1") },
        limit: { key: "l", transform: (value) => parseInt(value ?? "10") },
    })

    expect(target.current).toEqual({ page: 1, limit: 10 })

    Core.instance.navigate("?p=2&l=20")

    expect(target.current).toEqual({ page: 2, limit: 20 })
})

it("test update method with transform", () => {
    function asNumber(options: { min?: number; max?: number; default?: number } = {}) {
        const { min, max, default: defaultValue } = options
        const transform = (value: string | null) => parseInt(value!)

        const schema = v.pipe(
            v.union([v.string(), v.null()]),
            v.transform(transform),
            min != undefined ? v.minValue(min) : v.number(),
            max != undefined ? v.maxValue(max) : v.number()
        )

        return v.parser(v.fallback(schema, defaultValue as any))
    }

    const definition = defineParamDefinition({
        page: { transform: asNumber({ default: 1, min: 1 }) },
        limit: { transform: asNumber({ default: 10, min: 10 }) },
    })

    const target = param(definition)

    expect(target.current).toEqual({ page: 1, limit: 10 })

    target.update({ page: 2 })
    expect(target.current).toEqual({ page: 2, limit: 10 })
    target.update({ page: -2 })
    expect(target.current).toEqual({ page: 1, limit: 10 })
    target.update({ page: 20, limit: 100 })
    expect(target.current).toEqual({ page: 20, limit: 100 })
    target.update({ page: null, limit: null })
    expect(target.current).toEqual({ page: 1, limit: 10 })
})

it("test update method without transform", () => {
    const definition = defineParamDefinition({
        page: true,
        limit: true,
    })

    const target = param(definition)

    expect(target.current).toEqual({})

    target.update({ page: "2" })
    expect(target.current).toEqual({ page: "2" })
    target.update({ page: null })
    expect(target.current).toEqual({})
})

it("test push method without transform", () => {
    const definition = defineParamDefinition({
        page: true,
        limit: true,
    })

    const target = param(definition)

    expect(window.location.search).toEqual("")

    target.push()
    expect(window.location.search).toEqual("")

    target.update({ page: "2", limit: "20" })
    target.push()
    expect(window.location.search).toEqual("?limit=20&page=2")
})

it("test push method with transform & custom key", () => {
    const definition = defineParamDefinition({
        page: { key: "p", transform: (value) => parseInt(value ?? "1") },
        limit: { key: "l", transform: (value) => parseInt(value ?? "10") },
    })

    const target = param(definition)

    expect(window.location.search).toEqual("")

    target.push()
    expect(window.location.search).toEqual("")

    target.update({ page: 2, limit: 20 })
    target.push()
    expect(window.location.search).toEqual("?l=20&p=2")
    target.update({ page: null, limit: null })
    target.push()
    expect(window.location.search).toEqual("")
    target.update({ page: 1, limit: 10 })
    target.push()
    expect(window.location.search).toEqual("")
})
