class Listenable {
    protected listeners: Set<NoArgumentsFunction> = new Set()

    emit() {
        this.listeners.forEach((listener) => listener())
    }

    subscribe(listener: NoArgumentsFunction) {
        this.listeners.add(listener)
        return () => void this.listeners.delete(listener)
    }
}

export { Listenable }
