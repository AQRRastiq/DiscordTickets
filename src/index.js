/**
 * DiscordTickets
 * Copyright (C) 2021 Isaac Saunders
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * @name @eartharoid/discordtickets
 * @description An open-source & self-hosted Discord bot for ticket management.
 * @copyright 2021 Isaac Saunders
 * @license GNU-GPLv3
 */

const node_version = Number(process.versions.node.split('.')[0]);
if (node_version < 14) return console.log(`Error: DiscordTickets does not work on Node v${node_version}. Please upgrade to v14 or above.`);
const { version } = require('../package.json');

const fs = require('fs');
const { path } = require('./utils/fs');
if (!fs.existsSync(path('./.env'))) return console.log('Please make a copy of \'example.env\' called \'.env\'');
if (!fs.existsSync(path('./user/config.js'))) return console.log('Please make a copy of \'example.config.js\' called \'config.js\'');

require('dotenv').config();

const config = require('../user/config');

const Logger = require('leekslazylogger');
const log = new Logger({
	name: 'DiscordTickets by eartharoid',
	debug: config.debug,
	logToFile: config.logs.enabled,
	keepFor: config.logs.keep_for
});


const terminalLink = require('terminal-link');
log.report = error => {
	let report = [
		'<< Issue report >>',
		'Please include this information if you ask for help about the following error!',
		`Support server: ${terminalLink('go.eartharoid.me/discord', 'https://go.eartharoid.me/discord')}`,
		`Node.JS version: ${process.versions.node.split('.')}`,
		`Bot version: ${version}`,
		`Platform: ${process.platform}`
	];
	log.warn(report.join('\n'));
	if (error) log.error(error);
};

const { Client } = require('discord.js');
class Bot extends Client {
	constructor() {
		super({
			autoReconnect: true,
		});

		Object.assign(this, {
			config,
			db: require('./modules/database')(log),
			log,
		});

		this.log.info('Connecting to Discord API');

		this.login();
	}
}

new Bot();

process.on('unhandledRejection', error => {
	log.report();
	log.warn('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}: ${error}`);
	log.error(error);
});

