import { config as dotEnvConfig } from 'dotenv'
import { Client } from 'discord.js'

const dotEnvResult = dotEnvConfig()
if(dotEnvResult.error) throw dotEnvResult.error

const client = new Client()

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
	if (msg.content === '!status') {
		// const emoji = msg.guild.emojis.cache.find(emoji => emoji.name === );
		msg.react('👌')
	}
})

client.login(process.env.DISCORD_TOKEN)