import path from 'path'
import FtpClient from 'ftp'

const ftp = new FtpClient()

const ftpEvent = (event: string): Promise<any> => new Promise((resolve, reject) => ftp.on(event, (e) => resolve(e)))
const ftpList = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.list(path, (err, list) => resolve(list)))
const ftpCwd = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.cwd(path, (err, currentDir) => resolve(currentDir)))
const ftpGet = (path: string): Promise<any> => new Promise((resolve, reject) => ftp.get(path, (err, stream) => resolve(stream)))

export interface Advancment {
	name: string
	fullName: string
	type: AdvancmentType
	criteria: {
		[key: string]: string
	}
	done: boolean
}

type AdvancmentType = 'recipes' | 'story' | 'husbandry' | 'adventure' | 'nether' | 'end'

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

export const advancements = async (filter?: Function): Promise<Map<string, Advancment[]>> => {
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
		const advancements: Map<string, Advancment[]> = new Map()
	
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
	
		for (const entry of files.entries()) {
			const [id, file] = entry
			const advs: Advancment[] = []
			for (const key in file) {
				const found = key.match(/minecraft:(\w+)/)
				if(!found) continue
				const adv = file[key]
				const type: AdvancmentType = found[0].slice(10) as any
				const name = key.slice(type.length + 11)
				advs.push({
					name,
					fullName: key,
					type,
					criteria: adv.criteria,
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
