import { afterEach, expect, it, vi } from "vitest"
import { effect, viewmodel } from "../src/decorators"
import { state, store } from "../src/listenable"

const spyWatcher = vi.fn()
const spyWatcherStore = vi.fn()

@viewmodel
class ViewModel {
    counter = state(0)
    user = store({ name: "John", age: 30 })

    @effect.immediate("counter")
    watchCounter(counter: number) {
        spyWatcher(counter)
    }

    @effect.immediate("user")
    watchUser(user: { name: string; age: number }) {
        spyWatcherStore(user)
    }
}

afterEach(() => {
    spyWatcher.mockClear()
    spyWatcherStore.mockClear()
})

it("should react immediately to state", () => {
    const viewModel = new ViewModel()

    expect(spyWatcher).toHaveBeenCalledTimes(1)
    expect(spyWatcher).toHaveBeenCalledWith(0)

    viewModel.counter.current++

    expect(spyWatcher).toHaveBeenCalledTimes(2)
    expect(spyWatcher).toHaveBeenCalledWith(1)
    viewModel.counter.current = 1
    expect(spyWatcher).toHaveBeenCalledTimes(2)
})

it("should react immediately to store", () => {
    const viewModel = new ViewModel()

    expect(spyWatcherStore).toHaveBeenCalledTimes(1)
    expect(spyWatcherStore).toHaveBeenCalledWith({ name: "John", age: 30 })

    viewModel.user.smartUpdate((draft) => {
        draft.name = "Jane"
    })

    expect(spyWatcherStore).toHaveBeenCalledTimes(2)
    expect(spyWatcherStore).toHaveBeenCalledWith({ name: "Jane", age: 30 })
})
