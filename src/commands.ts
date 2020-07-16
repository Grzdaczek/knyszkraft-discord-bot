import { Message } from "discord.js"
import * as serverproject from './serverproject'
import * as mojang from './mojang'

export const status = async (msg: Message): Promise<void> => {
	msg.react('👌')
}

export const error = async (msg: Message, error: Error): Promise<void> => {
	msg.react('❌')
	msg.channel.stopTyping()
	msg.channel.send(`Coś poszło nie tak\n\`\`\`diff\n- ${error.message}\n\`\`\``)
}

export const scoreboard = async (msg: Message): Promise<void> => {
	try {
		console.log('Scoreboard request recived')
		msg.channel.startTyping()
		
		const advs = await serverproject.advancements()
		const ids = Array.from(advs.keys())
		const profiles = await mojang.getProfilesByIds(ids)
		const table = []
		for (const profile of profiles) {
			table.push({
				name: profile.name,
				score: advs.get(profile.id).reduce((score, adv) => adv.type !== 'recipes' && adv.done ? score+1 : score , 0)
			})
		}
		table.sort((a, b) => a.score < b.score ? 1 : -1)
		const scoreboard = table.map((x, i) => `#${(i+1).toString().padEnd(4, ' ')}${x.score.toString().padEnd(5, ' ')}${x.name}` ).join('\n')
		const reply = `\`\`\`css\n${scoreboard}\n\`\`\``
		
		msg.channel.stopTyping()
		msg.react('👌')
		msg.channel.send(reply)
		console.log('Scoreboard sent')
	}
	catch (err) {
		error(msg, err)
		console.error(err)
	}
}

export const progress = async (msg: Message): Promise<void> => {
	try {
		const username = msg.content.slice(10) || msg.author.username
		console.log({username})
		const profile = await mojang.getProfileByUsername(username)
		if(!profile) {
			msg.channel.send('Nie ma tu takiego. Spróbuj napisać \n```\n!progress [poprawna nazwa użytkownika]\n``` lub po prostu ustaw normalny pseudonim.')
			msg.react('🤦')
			return
		}
		msg.react('👌')
		
		const advs = await serverproject.advancements(id => id === profile.id)
		const list = advs.get(profile.id).filter(adv => adv.type !== 'recipes' && !adv.done)
		const messages = list.map(x => `\`\`\`js\n'${x.name}'\n${Object.keys(x.criteria).join('\n')}\n\`\`\``)
		messages.forEach(m => msg.author.send(m))
	}
	catch (err) {
		error(msg, err)
		console.error(err)
	}
}