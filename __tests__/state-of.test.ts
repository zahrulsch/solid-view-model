import { renderHook } from "@solidjs/testing-library"
import { expect, it } from "vitest"
import { viewmodel } from "../src/decorators"
import { state } from "../src/listenable"
import { defineViewModel } from "../src/utils/define-view-model"

it("should return reactive state into hooks UI", () => {
    @viewmodel
    class ViewModel {
        counter = state(0)

        increment() {
            this.counter.current++
        }
    }

    const viewModel = defineViewModel(ViewModel)
    const { result } = renderHook(() => viewModel.stateOf("counter"))

    expect(result.current).toBe(0)
    viewModel.increment()
    expect(result.current).toBe(1)
})
