import { expect, it } from "vitest"
import { Core } from "../src/core/core"

it("test eventListeners", () => {
    const listener1 = (next: string, _: any) => {}
    const listener2 = (next: string, _: any) => {}
    const listener3 = (delta: number) => {}

    Core.instance.addEventListener("navigate:string", listener1)
    Core.instance.addEventListener("navigate:string", listener2)
    Core.instance.addEventListener("navigate:number", listener3)

    expect(Core.instance["eventListeners"].length).toBe(3)
    expect(Core.instance["eventListeners"][0]).toEqual(["navigate:string", listener1])
    expect(Core.instance["eventListeners"][1]).toEqual(["navigate:string", listener2])
    expect(Core.instance["eventListeners"][2]).toEqual(["navigate:number", listener3])

    Core.instance.removeEventListener("navigate:string", listener1)
    expect(Core.instance["eventListeners"].length).toBe(2)

    Core.instance.removeEventListener("navigate:string", listener2)
    expect(Core.instance["eventListeners"].length).toBe(1)

    Core.instance.removeEventListener("navigate:number", listener3)
    expect(Core.instance["eventListeners"].length).toBe(0)
})

it("test emitListeners", () => {
    const listener1 = (solidLocation?: any) => {}
    const listener2 = (solidLocation?: any) => {}

    const unsubscribe1 = Core.instance.subscribe(listener1)
    const unsubscribe2 = Core.instance.subscribe(listener2)

    expect(Core.instance["emitListeners"].length).toBe(2)
    expect(Core.instance["emitListeners"][0]).toBe(listener1)
    expect(Core.instance["emitListeners"][1]).toBe(listener2)

    unsubscribe1()
    expect(Core.instance["emitListeners"].length).toBe(1)

    unsubscribe2()
    expect(Core.instance["emitListeners"].length).toBe(0)
})

it("test navigate without integrate solid router", () => {
    const visited: string[] = []
    const listener = (_?: SolidLocation) => {
        visited.push(window.location.pathname)
    }

    Core.instance.subscribe(listener)

    Core.instance.navigate("/home")
    Core.instance.navigate("/home")
    Core.instance.navigate("/about")
    Core.instance.navigate("/contact")
    Core.instance.navigate("/home")

    expect(visited).toEqual(["/home", "/home", "/about", "/contact", "/home"])
})

// test navigate with integrate solid router in view-model-provider.test.tsx
