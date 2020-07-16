import { config as dotEnvConfig } from 'dotenv'
import { Client } from 'discord.js'
import * as commands from './commands'
import * as serverproject from './serverproject'

const dotEnvResult = dotEnvConfig()
if(dotEnvResult.error) throw dotEnvResult.error

const client = new Client()
const cmds = new Map()

cmds.set('!status', commands.status)
cmds.set('!scoreboard', commands.scoreboard)
cmds.set('!progress', commands.progress)

client.on('message', msg => {
	if(!cmds.has(msg.content)) return
	else cmds.get(msg.content)(msg)
})

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.DISCORD_TOKEN)