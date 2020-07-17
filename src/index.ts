import { config as dotEnvConfig } from 'dotenv'
import { Client } from 'discord.js'
import * as commands from './commands'

if(process.env.NODE_ENV !== 'production') {
	const dotEnvResult = dotEnvConfig()
	if(dotEnvResult.error) throw dotEnvResult.error
}

const client = new Client()

const commandMatch: [RegExp, Function][] = [
	[/^!status$/, commands.status],
	[/^!scoreboard$/, commands.scoreboard],
	[/^!progress( \S+)?$/, commands.progress],
]

client.on('message', msg => {
	if(msg.content[0] !== '!') return
	for (const [regex, fn] of commandMatch) if(msg.content.match(regex)) return fn(msg)
})

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.DISCORD_TOKEN)