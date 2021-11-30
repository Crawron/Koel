import { Controller } from "../modules/Controller"

export const controllerStore = new (class ControllerStore {
	private controllers = new Map<string, Controller>()

	public get(guildId: string) {
		return this.controllers.get(guildId)
	}

	public create(guildId: string) {
		const controller = new Controller(guildId)
		this.controllers.set(guildId, controller)
		return controller
	}

	public getOrCreate(guildId: string) {
		return this.get(guildId) || this.create(guildId)
	}

	public delete(guildId: string) {
		return this.controllers.delete(guildId)
	}
})()
