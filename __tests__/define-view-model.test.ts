import { expect, it } from "vitest"
import { viewmodel } from "../src/decorators"
import { defineViewModel } from "../src/utils/define-view-model"

it("should be able to define a view model", () => {
    @viewmodel
    class ValidViewModel {}

    expect(() => defineViewModel(ValidViewModel)).not.toThrow()
})

it("should throw an error if the provided constructor does not implement the ViewModel interface", () => {
    class InvalidViewModel {}

    expect(() => defineViewModel(InvalidViewModel)).toThrow(
        "The provided constructor does not implement the ViewModel interface."
    )
})
