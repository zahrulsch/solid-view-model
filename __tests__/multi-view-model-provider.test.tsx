import { render } from "@solidjs/testing-library"
import { expect, it } from "vitest"
import { defineViewModel, viewmodel, ViewModelProvider } from "../src"
import { Core } from "../src/core/core"
import { RouterWrapper } from "./utils/wrapper"

it("should registered view models", () => {
    @viewmodel
    class One {}

    @viewmodel
    class Two {}

    @viewmodel
    class Three {}

    const one = defineViewModel(One)
    const two = defineViewModel(Two)
    const three = defineViewModel(Three)

    function Component() {
        return <ViewModelProvider viewModel={[one, two, three]} />
    }

    render(() => <Component />, { wrapper: RouterWrapper })

    expect(Core.instance.getViewModel("One")).toBe(one)
    expect(Core.instance.getViewModel("Two")).toBe(two)
    expect(Core.instance.getViewModel("Three")).toBe(three)
})
