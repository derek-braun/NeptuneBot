const Discord = require('discord.js');
const http = require('http');
const bot = new Discord.Client();

require('dotenv').config();

const playerInfo = require(process.env.PLAYER_JSON);

const GAME_ID = process.env.GAME_ID;
const URL = "http://nptriton.cqproject.net/game/" + GAME_ID + "/";

const TOTAL_PLAYERS = Object.keys(playerInfo).length;

const CATEGORIES = [
"Economy",
"Industry",
"Science",
"Total Stars",
"Army Size",
"Terraforming",
"Hyperspace",
"Scanning",
"Experimentation",
"Weapons",
"Banking",
"Manufacturing",
]

const helpResponse = new Discord.MessageEmbed()
	.setColor('#000000')
	.setTitle('Usage Guide')
	.setDescription("Hi I'm Neptune Bot. I can provide all sorts of useful data to help you achieve total galactic dominion in Neptune's Pride.\n\n \
		**Here are a list of my commands:**\n \
		`!help` : Show usage info\n \
		`!player [First Name]` : Show a player's current stats\n \
		`!compare [First Name 1] [First Name 2]` : Show the relative stats between two players\n \
		`!shame` : Show who hasn't locked in their turns yet\n")
	.setTimestamp();

var useChannel = undefined;

bot.on('message', async message => {

	useChannel = message.channel;

	if(message.content.charAt(0) === '!')
	{
		var commandSet = message.content.substring(1, message.content.length).split(' ');

		if(commandSet.length)
		{
			switch(commandSet[0])
			{
				case "help":
					message.channel.send(helpResponse);
					break;
				case "player":
					if(commandSet[1] != undefined)
					{
						player(message.channel, commandSet[1]);
					}
					break;
				case "compare":
					if(commandSet[1] != undefined && commandSet[2] != undefined)
					{
						compare(message.channel, commandSet[1], commandSet[2]);
					}
					break;
				case "shame":
					waitingFor(message.channel);
					break;
				default:
					console.log("Invalid command");
			}
		}
	}
});

function apiRequest(url, channel, callback)
{
	var response = "default";

	http.get(url,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            callback(json);
        } catch (error) {
        	console.log(error);
            channel.send("Sorry I can't access the game data at the moment...");
        };
    });

    return response;
}).on("error", (error) => {
    console.log("Can't fetch json data");
});
}

function player(channel, name)
{
	apiRequest(URL + "players", channel, (json) => {
		index = getPlayerIndex(playerInfo, name.toLowerCase());

		if(index == -1)
		{
			return;
		}

		var message = new Discord.MessageEmbed()
			.setColor(playerInfo[index].color)
			.setTitle(json[index].alias)
			.setThumbnail(playerInfo[index].image)
			.addFields(
				{ name: CATEGORIES[0], value: json[index].total_economy, inline: true },
				{ name: CATEGORIES[1], value: json[index].total_industry, inline: true },
				{ name: CATEGORIES[2], value: json[index].total_science, inline: true },
				{ name: CATEGORIES[3], value: json[index].total_stars},
				{ name: CATEGORIES[4], value: json[index].total_strength},
				{ name: CATEGORIES[5], value: json[index].tech.terraforming.level, inline: true },
				{ name: CATEGORIES[6], value: json[index].tech.propulsion.level, inline: true },
				{ name: CATEGORIES[7], value: json[index].tech.scanning.level, inline: true },
				{ name: CATEGORIES[8], value: json[index].tech.research.level, inline: true},
				{ name: CATEGORIES[9], value: json[index].tech.weapons.level, inline: true },
				{ name: CATEGORIES[10], value: json[index].tech.banking.level, inline: true },
				{ name: CATEGORIES[11], value: json[index].tech.manufacturing.level},
			)
			.setTimestamp();

		channel.send(message);
	});
}

function compare(channel, name1, name2)
{
	apiRequest(URL + "players", channel, (json) => {
		index1 = getPlayerIndex(playerInfo, name1.toLowerCase());
		index2 = getPlayerIndex(playerInfo, name2.toLowerCase());


		var message = new Discord.MessageEmbed()
			.setColor("#ffffff")
			.setTitle(json[index1].alias + " vs. " + json[index2].alias)
			.addFields(
				{ name: formatCompareText(json[index1].total_economy, json[index2].total_economy, CATEGORIES[0]), value: json[index1].total_economy + " to " + json[index2].total_economy, inline: true },
				{ name: formatCompareText(json[index1].total_industry, json[index2].total_industry, CATEGORIES[1]), value: json[index1].total_industry + " to " + json[index2].total_industry, inline: true },
				{ name: formatCompareText(json[index1].total_science, json[index2].total_science, CATEGORIES[2]), value: json[index1].total_science + " to " + json[index2].total_science, inline: true },
				{ name: formatCompareText(json[index1].total_stars, json[index2].total_stars, CATEGORIES[3]), value: json[index1].total_stars + " to " + json[index2].total_stars},
				{ name: formatCompareText(json[index1].total_strength, json[index2].total_strength, CATEGORIES[4]), value: json[index1].total_strength + " to " + json[index2].total_strength},
				{ name: formatCompareText(json[index1].tech.terraforming.level, json[index2].tech.terraforming.level, CATEGORIES[5]), value: json[index1].tech.terraforming.level + " to " + json[index2].tech.terraforming.level, inline: true },
				{ name: formatCompareText(json[index1].tech.propulsion.level, json[index2].tech.propulsion.level, CATEGORIES[6]), value: json[index1].tech.propulsion.level + " to " + json[index2].tech.propulsion.level, inline: true },
				{ name: formatCompareText(json[index1].tech.scanning.level, json[index2].tech.scanning.level, CATEGORIES[7]), value: json[index1].tech.scanning.level + " to " + json[index2].tech.scanning.level, inline: true },
				{ name: formatCompareText(json[index1].tech.research.level, json[index2].tech.research.level, CATEGORIES[8]), value: json[index1].tech.research.level + " to " + json[index2].tech.research.level, inline: true},
				{ name: formatCompareText(json[index1].tech.weapons.level, json[index2].tech.weapons.level, CATEGORIES[9]), value: json[index1].tech.weapons.level + " to " + json[index2].tech.weapons.level, inline: true },
				{ name: formatCompareText(json[index1].tech.banking.level, json[index2].tech.banking.level, CATEGORIES[10]), value: json[index1].tech.banking.level + " to " + json[index2].tech.banking.level, inline: true },
				{ name: formatCompareText(json[index1].tech.manufacturing.level, json[index2].tech.manufacturing.level, CATEGORIES[11]), value: json[index1].tech.manufacturing.level + " to " + json[index2].tech.manufacturing.level},
			)
			.setTimestamp();

		channel.send(message);
	});
}

function formatCompareText(val1, val2, baseString)
{
	if(val1 > val2)
	{
		return baseString = "***__" + baseString + "__***";
	}
	else if(val1 < val2)
	{
		return baseString = "~~" + baseString + "~~";
	}

	return baseString;
}

function waitingFor(channel)
{
	apiRequest(URL + "players", channel, (json) => {
		var waitingArr = [];
		var message = "";
		for(var i = 0; i < TOTAL_PLAYERS; i++)
		{
			if(json[i].ready == 0)
			{
				waitingArr.push(json[i].alias);
			}	
		}

		if(waitingArr.length == 0 || waitingArr.length == TOTAL_PLAYERS)
		{
			message = new Discord.MessageEmbed()
				.setColor("#00ff00")
				.setTitle("New Turn - Ready Your Armies!")
				.setTimestamp();
		}
		else
		{
			var shameString = "";
			for(var i = 0; i < waitingArr.length; i++)
			{
				shameString += waitingArr[i] + ", ";
			}
			shameString = shameString.substring(0, shameString.length - 2);
			message = new Discord.MessageEmbed()
			.setColor("#ff0000")
			.setTitle("SHAME!")
			.addFields(
				{ name: 'Waiting For:', value: shameString},
			)
			.setTimestamp();
		}
		channel.send(message);
	});
}

function getPlayerIndex(json, name)
{
	for(var i = 0; i < TOTAL_PLAYERS; i++)
	{
		if(json[i].name == name)
		{
			return i;
		}
	}
	return -1;
}

bot.login(process.env.BOT_KEY);