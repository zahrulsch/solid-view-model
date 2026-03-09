import type { ViewModel } from "./view-model"

export class ViewModelBox {
    private box: Map<string, ViewModel> = new Map()

    get<T extends ViewModel>(key: string): T | never {
        const result = this.box.get(key)

        if (!result) {
            throw new Error(`ViewModel not found: ${key}`)
        }

        return result as T
    }

    set<T extends ViewModel>(key: string, value: T): void | never {
        if (this.box.has(key)) {
            throw new Error(`ViewModel with key "${key}" is already bound`)
        }

        this.box.set(key, value)
    }

    has(key: string): boolean {
        return this.box.has(key)
    }

    delete(key: string): void {
        if (!this.box.has(key)) return
        this.box.delete(key)
    }
}
