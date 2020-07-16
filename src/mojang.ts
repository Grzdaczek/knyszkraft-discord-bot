import axios from 'axios'

declare module Mojang {

	export interface Profile {
		id: string
		name: string
		properties: ProgileProperty[]
	}

	export interface ProgileProperty {
		name: string
		value: string
		signature: string
	}
}

export const getProfilesByIds = async (ids: string[]): Promise<Mojang.Profile[]> => {
	const responses = await Promise.all(ids.map(id => axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`)))
	return responses.map(r => r.data)
}

export const getProfileById = async (id: string): Promise<Mojang.Profile | Mojang.Profile[]> => {
	const response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`)
	return response.data
}
