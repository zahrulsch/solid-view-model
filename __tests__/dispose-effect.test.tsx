import { Route, Router } from "@solidjs/router"
import { render } from "@solidjs/testing-library"
import { expect, it, vi } from "vitest"
import { ViewModelProvider } from "../src/components/view-model-provider"
import { disposable, viewmodel } from "../src/decorators"
import { defineViewModel } from "../src/utils/define-view-model"

function Wrapper(props: { children: any }) {
    return (
        <Router>
            <Route path="*404" component={() => props.children} />
        </Router>
    )
}

it("should clean up effects on unmount", () => {
    const spyClearUserData = vi.fn()
    const spyClearResources = vi.fn()

    @viewmodel
    class ViewModel {
        @disposable protected clearUserData() {
            spyClearUserData()
        }

        @disposable protected clearResources() {
            spyClearResources()
        }
    }

    const instance = defineViewModel(ViewModel)

    const { unmount } = render(() => <ViewModelProvider viewModel={instance}></ViewModelProvider>, {
        wrapper: Wrapper,
    })

    unmount()

    expect(spyClearUserData).toHaveBeenCalled()
    expect(spyClearResources).toHaveBeenCalled()
})
