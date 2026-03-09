import { Core } from "../core/core"

export function navigate(url: string) {
    Core.instance.location.navigate(url)
}
