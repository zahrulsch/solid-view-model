import { Route, Router } from "@solidjs/router"
import { render } from "@solidjs/testing-library"
import { expect, it } from "vitest"
import { ViewModelProvider } from "../src/components/view-model-provider"
import { Core } from "../src/core/core"
import { viewmodel } from "../src/decorators"
import { defineViewModel } from "../src/utils/define-view-model"
import { sleep } from "./utils/sleep"

function Wrapper(props: { children: any }) {
    return (
        <Router>
            <Route path="*404" component={() => props.children} />
        </Router>
    )
}

it("event listeners are added and removed", () => {
    const { unmount } = render(() => <ViewModelProvider />, { wrapper: Wrapper })

    expect(Core.instance["eventListeners"].length).toBe(2)

    unmount()

    expect(Core.instance["eventListeners"].length).toBe(0)
})

it("should navigate to a string path", async () => {
    render(() => <ViewModelProvider />, { wrapper: Wrapper })

    const visited: (string | undefined)[] = []

    Core.instance.subscribe((solidLocation) => {
        visited.push(solidLocation?.pathname)
    })

    Core.instance.navigate("/home")
    await sleep()
    Core.instance.navigate("/about")
    await sleep()
    Core.instance.navigate("/about")
    await sleep()

    expect(visited).toEqual(["/home", "/about"])
})

it("should register and get viewmodel", () => {
    @viewmodel
    class ViewModel {}

    const instance = defineViewModel(ViewModel)

    const result = render(() => <ViewModelProvider viewModel={instance}></ViewModelProvider>, {
        wrapper: Wrapper,
    })

    expect(Core.instance.getViewModel("ViewModel")).toBe(instance)

    result.unmount()

    expect(Core.instance.getViewModel("ViewModel")).toBeUndefined()
})
