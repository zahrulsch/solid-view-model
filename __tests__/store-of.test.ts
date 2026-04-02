import { renderHook } from "@solidjs/testing-library"
import { expect, it } from "vitest"
import { viewmodel } from "../src/decorators"
import { store } from "../src/listenable"
import { defineViewModel } from "../src/utils/define-view-model"

it("should return reactive store into hook", () => {
    @viewmodel
    class ViewModel {
        state = store({ name: "John", age: 30 })

        changeName(name: string) {
            this.state.smartUpdate((draft) => {
                draft.name = name
            })
        }

        changeAge(age: number) {
            this.state.smartUpdate((draft) => {
                draft.age = age
            })
        }
    }

    const viewModel = defineViewModel(ViewModel)
    const { result } = renderHook(() => viewModel.storeOf("state"))

    expect(result).toEqual({ name: "John", age: 30 })

    viewModel.changeName("Jane")
    expect(result).toEqual({ name: "Jane", age: 30 })

    viewModel.changeAge(25)
    expect(result).toEqual({ name: "Jane", age: 25 })
})
