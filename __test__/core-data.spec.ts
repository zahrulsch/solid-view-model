import { afterAll, describe, expect, it } from "vitest"
import { Core } from "../core/core"
import { navigate } from "../test-utils/navigate"

describe("CoreData test", () => {
    afterAll(() => navigate("/"))

    it("test singleton instance", () => {
        const coreData = Core.instance
        expect(coreData).toBeInstanceOf(Core)

        const coreData2 = Core.instance
        expect(coreData2).toStrictEqual(coreData)
    })

    it("test url stream", async () => {
        const coreData = Core.instance

        expect(coreData.currentUrl.pathname).toBe("/")

        const visited = [] as string[]

        const unsubs = coreData.subscribe(() => {
            visited.push(coreData.currentUrl.pathname + coreData.currentUrl.search)
        })

        const unsubs2 = coreData.subscribe(() => {
            // cuma untuk memastikan patch hanya dipanggil sekali meskipun subscribe dipanggil berkali-kali
            // const searchParams = coreData.location.searchParams
            // console.log(Object.fromEntries(searchParams.entries()))
        })

        navigate("/test-url?page=10&sort=asc")
        navigate("/test-url?page=120&sort=asc")
        navigate("/test-url?page=20&sort=asc")
        navigate("/test-url?page=30&sort=asc")

        expect(visited).toStrictEqual([
            "/test-url?page=10&sort=asc",
            "/test-url?page=120&sort=asc",
            "/test-url?page=20&sort=asc",
            "/test-url?page=30&sort=asc",
        ])

        unsubs()
        unsubs2()
    })
})
