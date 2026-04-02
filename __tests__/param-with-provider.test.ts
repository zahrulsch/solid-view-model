import { renderHook } from "@solidjs/testing-library"
import { expect, it } from "vitest"
import { viewmodel } from "../src/decorators"
import { param } from "../src/listenable/param"
import { defineViewModel } from "../src/utils/define-view-model"
import { sleep } from "./utils/sleep"
import { Wrapper } from "./utils/wrapper"

@viewmodel
class ViewModel {
    query = param({ page: true, limit: true })
}

it("test param update method with provider", () => {
    const target = defineViewModel(ViewModel)
    const { result } = renderHook(() => target.paramOf("query"), { wrapper: Wrapper() })

    expect(result).toEqual({})

    target.query.update({ page: "2", limit: "20" })

    expect(result).toEqual({ page: "2", limit: "20" })

    target.query.update({ page: null, limit: null })

    expect(result).toEqual({})
})

it("test param push method with provider", async () => {
    const target = defineViewModel(ViewModel)
    const { result } = renderHook(() => target.paramOf("query"), {
        wrapper: Wrapper([{ to: "/home", label: "Home" }]),
    })

    expect(window.location.search).toEqual("")

    target.query.push()

    expect(window.location.search).toEqual("")

    target.query.update({ page: "2", limit: "20" })
    target.query.push()

    await sleep()

    expect(window.location.search).toEqual("?limit=20&page=2")
    expect(result).toEqual({ page: "2", limit: "20" })

    target.query.update({ page: null, limit: null })
    target.query.push()

    await sleep()

    expect(window.location.search).toEqual("")
    expect(result).toEqual({})
})
