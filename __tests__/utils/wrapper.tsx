import { A, Route, Router } from "@solidjs/router"
import { For, JSXElement } from "solid-js"
import { ViewModelProvider } from "../../src/components/view-model-provider"

type Link = {
    to: string
    label: string
}

export function Wrapper(links: Link[] = []) {
    return (props?: { children: any }) => (
        <Router>
            <Route
                path="*404"
                component={() => (
                    <ViewModelProvider>
                        <Container links={links}>{props?.children}</Container>
                    </ViewModelProvider>
                )}
            />
        </Router>
    )
}

type ContainerProps = {
    children: any
    links?: Link[]
}

function Container(props?: ContainerProps) {
    return (
        <div class="container">
            {props?.children}

            <For each={props?.links}>
                {(link) => (
                    <A href={link.to} class="link">
                        {link.label}
                    </A>
                )}
            </For>
        </div>
    )
}

interface RouterWrapperProps {
    children?: JSXElement
}

export function RouterWrapper(props: RouterWrapperProps) {
    return (
        <Router>
            <Route path="*404" component={() => props.children} />
        </Router>
    )
}
