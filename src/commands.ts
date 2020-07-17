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
				score: advs.get(profile.id).reduce((score, adv) => adv.category !== 'recipes' && adv.done ? score+1 : score , 0)
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
		const nickname = msg.guild && msg.guild.member(msg.author).displayName || msg.author.username
		const player = msg.content.slice(10) || nickname

		// console.log({
		// 	nickname: msg.guild.member(msg.author).displayName, 
		// 	username: msg.author.username,
		// 	player: msg.content.slice(10),
		// 	chosen: player
		// })

		const profile = await mojang.getProfileByUsername(player)
		if(!profile) {
			msg.channel.send('Nie ma tu takiego. Spróbuj napisać \n```\n!progress [poprawna nazwa użytkownika]\n``` lub po prostu ustaw pseudonim zgadny z nazwą w grze.')
			msg.react('🤦')
			return
		}
		
		const advs = await serverproject.advancements(id => id === profile.id)
		const list = advs.get(profile.id).filter(adv => adv.category !== 'recipes' && !adv.done)
		const messages = list.map(x =>
			`.${x.name.padEnd(20, '.')}: ` +
			`${Math.floor(x.completion*100)}% ` +
			`╠${''.padEnd(x.completion*30, '█').padEnd(30,'═')}╣ ` +
			('[' + x.criteriaDone.length + '/' + (x.criteriaDone.length+x.criteriaLeft.length) + ']').padEnd(8, ' ') +
			`/*${x.criteriaLeft.join(', ')}*/\n`
		)
		msg.react('👌')
		msg.author.send('```css\n' + messages.join('\n') + '```')
	}
	catch (err) {
		error(msg, err)
		console.error(err)
	}
}