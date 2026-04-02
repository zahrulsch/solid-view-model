import { afterEach, expect, it, vi } from "vitest"
import { effect, viewmodel } from "../src/decorators"
import { state, store } from "../src/listenable"

const spyWatcher = vi.fn()

type UserData = {
    name: string
    age: number
}

@viewmodel
class TestViewModel {
    protected counter = state(0)
    protected user = store<UserData>({ name: "John", age: 30 })

    @effect.lazy("counter")
    protected watchCounter(counter: number) {
        spyWatcher(counter)
    }

    @effect.lazy("user")
    protected watchUserName(user: UserData) {
        spyWatcher(user)
    }

    increment() {
        this.counter.current++
    }

    changeUserData(payload: Partial<UserData>) {
        this.user.smartUpdate((draft) => {
            draft.name = payload.name ?? draft.name
            draft.age = payload.age ?? draft.age
        })
    }
}

afterEach(() => spyWatcher.mockClear())

it("should react to state change lazyly", () => {
    const viewModel = new TestViewModel()

    expect(spyWatcher).toHaveBeenCalledTimes(0)

    viewModel.increment()

    expect(spyWatcher).toHaveBeenCalledTimes(1)
    expect(spyWatcher).toHaveBeenCalledWith(1)
})

it("should react to store change lazyly", () => {
    const viewModel = new TestViewModel()

    expect(spyWatcher).toHaveBeenCalledTimes(0)

    viewModel.changeUserData({ name: "Jane" })

    expect(spyWatcher).toHaveBeenCalledTimes(1)
    expect(spyWatcher).toHaveBeenCalledWith({ name: "Jane", age: 30 })

    viewModel.changeUserData({ age: 30 })

    expect(spyWatcher).toHaveBeenCalledTimes(1)
    viewModel.changeUserData({ age: 30, name: "Roman" })
    expect(spyWatcher).toHaveBeenCalledTimes(2)
    expect(spyWatcher).toHaveBeenCalledWith({ name: "Roman", age: 30 })
})
