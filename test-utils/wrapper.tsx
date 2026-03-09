import { Route, Router } from "@solidjs/router"
import type { Component, JSXElement } from "solid-js"

export const wrapper: Component<{ children?: JSXElement }> = (props) => {
    return (
        <Router>
            <Route path="*" component={() => props.children} />
        </Router>
    )
}
