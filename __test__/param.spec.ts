import { afterEach, describe, expect, it, vi } from "vitest"
import { param } from "../core"
import { navigate } from "../test-utils/navigate"

describe("Param class testing", () => {
    afterEach(() => navigate("/"))
    afterEach(() => vi.clearAllMocks())

    it('check parsing hasil tanpa "rename"', () => {
        const paramTest = param({
            page: {},
            limit: {},
        })

        const visited = [] as any[]

        const unsubscribe = paramTest.subscribe(() => {
            visited.push(paramTest.currentValue)
        })

        navigate("/test-url?page=10&limit=20")

        expect(visited).toStrictEqual([
            {
                page: "10",
                limit: "20",
            },
        ])

        unsubscribe()
    })

    it('check parsing hasil dengan "rename"', async () => {
        const subject = param({
            page: {
                rename: "p",
            },
            limit: {},
        })

        const visited = [] as any[]

        const unsubscribe = subject.subscribe(() => {
            visited.push(subject.currentValue)
        })

        navigate("/test-url?p=10&limit=20")
        navigate("/test-url?p=&limit=")

        expect(visited).toEqual([
            {
                page: "10",
                limit: "20",
            },
            {
                page: "",
                limit: "",
            },
        ])

        unsubscribe()
    })

    it('check parsing hasil dengan "transform" tanpa "rename"', async () => {
        const subject = param({
            page: {
                validate(value) {
                    return value ? parseInt(value) : 0
                },
            },
            limit: {},
        })

        expect(subject.currentValue).toEqual({
            page: 0,
            limit: null,
        })

        const visited = [] as any[]

        const unsubscribe = subject.subscribe(() => {
            visited.push(subject.currentValue)
        })

        navigate("/test-url?page=10&limit=20")
        navigate("/test-url?page=&limit=")

        expect(visited).toEqual([
            {
                page: 10,
                limit: "20",
            },
            {
                page: 0,
                limit: "",
            },
        ])

        unsubscribe()
    })

    it('check parsing hasil dengan "transform" dengan "rename"', async () => {
        const subject = param({
            page: {
                rename: "_page",
                validate(value) {
                    return value ? parseInt(value) : 0
                },
            },
            limit: {},
        })

        const visited = [subject.currentValue] as any[]

        const unsubscribe = subject.subscribe(() => {
            visited.push(subject.currentValue)
        })

        navigate("/test-url?_page=10&limit=20")
        navigate("/test-url?_page=&limit=")

        expect(visited).toEqual([
            {
                page: 0,
                limit: null,
            },
            {
                page: 10,
                limit: "20",
            },
            {
                page: 0,
                limit: "",
            },
        ])

        unsubscribe()
    })
})
