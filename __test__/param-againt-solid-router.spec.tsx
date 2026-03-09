import { A, useLocation, useNavigate } from "@solidjs/router"
import { render, renderHook } from "@solidjs/testing-library"
import { afterEach, expect, it, vi } from "vitest"
import { param, ViewModel } from "../core"
import { Core } from "../core/core"
import { Location } from "../core/location"
import { navigate } from "../test-utils/navigate"
import { sleep } from "../test-utils/sleep"
import { wrapper } from "../test-utils/wrapper"
import { ViewModelProvider } from "../ui/view-model-provider"

class BasicViewModel extends ViewModel {}

const viewModel = new BasicViewModel()

vi.spyOn(Location.prototype, "setNavigator")

afterEach(() => navigate("/"))

it("harus error ketika tidak dalam Route", () => {
    expect(() => render(() => <ViewModelProvider viewModel={viewModel} />)).toThrow()
})

it("tidak error ketika dalam Route", () => {
    expect(() =>
        render(() => <ViewModelProvider viewModel={viewModel} />, { wrapper })
    ).not.toThrow()
})

it("ketika sudah dalam route, coreLocation harus di ubah", () => {
    render(() => <ViewModelProvider viewModel={viewModel} />, { wrapper })
    render(() => <ViewModelProvider viewModel={viewModel} />, { wrapper })

    const navigator = Core.instance.location.navigator
    expect(navigator).toBeDefined()
})

it("test navigator, ketika di call hook @solidjs/router harus juga berimbas", async () => {
    const Wrapper = wrapper

    const { result } = renderHook(() => useLocation(), {
        wrapper(props) {
            return (
                <Wrapper>
                    <ViewModelProvider viewModel={viewModel}>{props.children}</ViewModelProvider>
                </Wrapper>
            )
        },
    })

    expect(Core.instance.location.navigator).toBeDefined()

    expect(result.pathname).toBe("/")

    Core.instance.location.navigate("/test-url")

    await sleep()

    expect(result.pathname).toBe("/test-url")
    expect(Core.instance.currentUrl.pathname).toBe(result.pathname)

    const testParam = param({
        page: {},
        limit: {},
    })

    expect(testParam()).toStrictEqual({
        page: null,
        limit: null,
    })

    Core.instance.location.navigate("/?page=10&limit=20")

    await sleep()

    expect(result.pathname).toBe("/")
    expect(result.search).toBe("?page=10&limit=20")

    expect(testParam()).toStrictEqual({
        page: "10",
        limit: "20",
    })

    expect(Core.instance.currentUrl.pathname).toBe(result.pathname)
    expect(Core.instance.currentUrl.search).toBe(result.search)
})

it("test navigator, ketika nav dilakukan oleh @solidjs/router Core.instance.location harus juga berubah", async () => {
    const Wrapper = wrapper

    const { result: solidNavigate } = renderHook(() => useNavigate(), {
        wrapper(props) {
            return (
                <Wrapper>
                    <ViewModelProvider viewModel={viewModel}>{props.children}</ViewModelProvider>
                </Wrapper>
            )
        },
    })

    const visited = [] as any[]
    const spy = vi.fn()

    const subject = param({
        photo: {},
    })

    subject.subscribe(() => {
        visited.push(subject.currentValue)
        spy()
    })

    solidNavigate("/libs/oke?photo=10")
    solidNavigate("/libs/oke?photo=10")
    solidNavigate("/libs/oke?photo=10")
    await sleep()
    expect(location.pathname).toBe("/libs/oke")
    expect(location.search).toBe("?photo=10")
    expect(Core.instance.currentUrl.pathname).toBe("/libs/oke")
    expect(Core.instance.currentUrl.search).toBe("?photo=10")

    expect(visited).toStrictEqual([{ photo: "10" }])
    expect(spy).toBeCalledTimes(1)
})

it('test efek dengan navigasi "A"', async () => {
    const Wrapper = wrapper

    const { getByTestId } = render(() => {
        return (
            <Wrapper>
                <ViewModelProvider viewModel={viewModel}>
                    <A href="/libs/oke?photo=10" data-testid="navigate">
                        Navigate
                    </A>
                </ViewModelProvider>
            </Wrapper>
        )
    })

    expect(getByTestId("navigate")).toBeInTheDocument()

    const subject = param({
        photo: {},
    })

    expect(subject()).toStrictEqual({
        photo: null,
    })

    getByTestId("navigate").click()

    await sleep()

    expect(subject()).toStrictEqual({
        photo: "10",
    })
})
