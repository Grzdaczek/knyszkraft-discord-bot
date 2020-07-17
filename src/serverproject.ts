import path from 'path'
import FtpClient from 'ftp'

export type IAdvancmentCategory = 'recipes' | 'story' | 'husbandry' | 'adventure' | 'nether' | 'end'
export interface IAdvancment {
	name: string,
	fullName: string,
	category: IAdvancmentCategory,
	criteriaAll: string[],
	criteriaDone: string[],
	criteriaLeft: string[],
	completion: number
	done: boolean
}
export const version = '1.16_20w14a'
export const advancmentCategories = ['recipes', 'story', 'husbandry', 'adventure', 'nether', 'end']
export const advancmentsCriteria = {
	adventuring_time: [
		'badlands',
		'badlands_plateau',
		'bamboo_jungle',
		'bamboo_jungle_hills',
		'beach',
		'birch_forest',
		'birch_forest_hills',
		'cold_ocean',
		'dark_forest',
		'deep_cold_ocean',
		'deep_frozen_ocean',
		'deep_lukewarm_ocean',
		'desert',
		'desert_hills',
		'forest',
		'frozen_river',
		'giant_tree_taiga',
		'giant_tree_taiga_hills',
		'jungle',
		'jungle_edge',
		'jungle_hills',
		'lukewarm_ocean',
		'mountains',
		'mushroom_field_shore',
		'mushroom_fields',
		'plains',
		'river',
		'savanna',
		'savanna_plateau',
		'snowy_beach',
		'snowy_mountains',
		'snowy_taiga',
		'snowy_taiga_hills',
		'snowy_tundra',
		'stone_shore', 
		'swamp',
		'taiga',
		'taiga_hills',
		'warm_ocean',
		'wooded_badlands_plateau',
		'wooded_hills',
		'wooded_mountains'
	],
	balanced_diet: [
		'apple',
		'baked_potato',
		'beetroot',
		'beetroot_soup',
		'bread',
		'carrot',
		'chorus_fruit',
		'cooked_beef',
		'cooked_chicken',
		'cooked_cod',
		'cooked_mutton',
		'cooked_porkchop',
		'cooked_rabbit',
		'cooked_salmon',
		'cookie',
		'dried_kelp',
		'enchanted_golden_apple',
		'golden_apple',
		'golden_carrot',
		'honey_bottle',
		'melon',
		'mushroom_stew',
		'poisonous_potato',
		'potato',
		'pufferfish',
		'pumpkin_pie',
		'rabbit_stew',
		'beef',
		'chicken',
		'cod',
		'mutton',
		'porkchop',
		'rabbit',
		'salmon',
		'rotten_flesh',
		'spider_eye',
		'suspicious_stew',
		'sweet_berries',
		'tropical_fish'
	],
	bred_all_animals: [
		'bee',
		'cat',
		'chicken',
		'cow',
		'donkey',
		'fox',
		'hoglin',
		'horse',
		'llama',
		'mooshroom',
		'mule',
		'ocelot',
		'panda',
		'pig',
		'rabbit',
		'sheep',
		'strider',
		'turtle',
		'wolf',
	],
	complete_catalogue: [
		'tabby',
		'tuxedo',
		'red',
		'siamese',
		'british_shorthair',
		'calico',
		'persian',
		'ragdoll',
		'white',
		'black',
		'jellie'
	],
	kill_all_mobs: [
		'blaze',
		'cave_spider',
		'creeper',
		'drowned',
		'enderman',
		'evoker',
		'ghast',
		'guardian',
		'husk',
		'magma_cube',
		'phantom',
		'pillager',
		'ravager',
		'shulker',
		'silverfish',
		'skeleton',
		'slime',
		'spider',
		'stray',
		'vindicator',
		'witch',
		'wither_skeleton',
		'zombie',
		'zombie_pigman',
		'zombie_villager',
		'elder_guardian',
		'enderdragon',
		'endermite',
		'hoglin',
		'piglin',
		'vex',
		'wither',
		'zoglin'
	],
	explore_nether: [
		'crimson_forest',
		'nether_wastes',
		'soul_sand_valley',
		'basalt_deltas',
		'warped_forest'
	]
}

const ftpEvent = (event: string): Promise<any> => new Promise((resolve, reject) => ftp.on(event, (e) => resolve(e)))
const ftpList = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.list(path, (err, list) => resolve(list)))
const ftpCwd = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.cwd(path, (err, currentDir) => resolve(currentDir)))
const ftpGet = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.get(path, (err, stream) => resolve(stream)))
const ftp = new FtpClient()

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

export const advancements = async (filter?: Function): Promise<Map<string, IAdvancment[]>> => {
	try {

		ftp.connect({
			host: process.env.FTP_HOST,
			port: 21,
			user: process.env.FTP_USERNAME,
			password: process.env.FTP_PASSWORD
		})
	
		await ftpEvent('ready')
		await ftpCwd('/world/advancements')
	
		const entryList: any[] = await ftpList('./')
		const files = new Map()
		const advancements: Map<string, IAdvancment[]> = new Map()
	
		for (const entry of entryList) {
			const id = path.basename(entry.name, '.json').replace(/\W/gi, '')
			if(filter && !filter(id)) continue
			const stream = await ftpGet(`./${entry.name}`)
			const file = await new Promise((resolve, reject) => {
				const chunks = []
				stream.on('data', (chunk: any) => chunks.push(chunk))
				stream.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())))
			})
			files.set(id, file)
		}
	
		ftp.end()
	
		//for evry player
		for (const entry of files.entries()) {
			const [id, file] = entry
			const advs: IAdvancment[] = []

			//for evry advancment of that player
			for (const key in file) {
				const found = key.match(/minecraft:(\w+)/)
				if(!found) continue
				const adv = file[key]
				const category: IAdvancmentCategory = found[0].slice(10) as any
				const name = key.slice(category.length + 11)
				const criteriaAll = advancmentsCriteria[name] || []
				const criteriaDone = Object.keys(adv.criteria).map(c => c.replace(/(minecraft:)|(\w+\/)|(\.\w+)/g, ''))
				const criteriaLeft = adv.done ? [] : criteriaAll.filter(c => !criteriaDone.includes(c))
				advs.push({
					name,
					fullName: key,
					category,
					criteriaAll,
					criteriaDone,
					criteriaLeft,
					completion: adv.done ? 1 : criteriaDone.length / (criteriaDone.length + criteriaLeft.length),
					done: adv.done,
				})
			}
			advancements.set(id, advs)
		}
	
		return advancements
		
	}
	catch(err) {
		throw err
	}
}
