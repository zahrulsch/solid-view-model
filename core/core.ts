import { Listenable } from "./listenable"
import { Location } from "./location"
import { ViewModelBox } from "./view-model-box"

export class Core extends Listenable<null> {
    private static _instance: Core | null = null

    public readonly location = new Location(this)
    public readonly viewModelBox = new ViewModelBox()

    static get instance(): Core {
        if (!this._instance) this._instance = new Core()
        return this._instance
    }

    private constructor() {
        super()
    }

    get currentUrl() {
        return this.location.current
    }

    get currentValue(): never {
        throw new Error("CoreData does not have a current value")
    }

    get previousValue(): never {
        throw new Error("CoreData does not have a previous value")
    }
}
