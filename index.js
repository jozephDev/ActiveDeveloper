const mySecret = process.env['TOKEN']
const express = require('express')
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('Subscribe to Abhinav singh on youtubr'))

app.listen(port, () =>
console.log(`Your app is listening a http://localhost:${port}`)
);

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const { token, mongo_URI, client_id } = require('./config.js');
const mongoose = require('mongoose');

const rest = new REST({ version: '9' }).setToken(token);

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs
  .readdirSync('./commands')
  .map(folder =>
    fs
      .readdirSync(`./commands/${folder}`)
      .filter(file => file.endsWith('.js'))
      .map(file => `./commands/${folder}/${file}`)
  )
  .flat();

for (const file of commandFiles) {
  const command = require(`${file}`);
  if (Object.keys(command).length === 0) continue;
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
  console.log("Loaded: "+command.data.name)
}

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands("902850458203344896"), 
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const eventFiles = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', () => {
  client.playerManager = new Map();
  client.triviaManager = new Map();
  client.guildData = new Collection();
  client.user.setActivity('/', { type: 'WATCHING' });
  mongoose
    .connect(encodeURI(mongo_URI), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Mongo is ready');
    })
    .catch(console.error);

  console.log('Ready as '+client.user.tag);
});

client.login(OTk5NzYxNTc2MTI5MjA0Mjg1.G7Vttn.nDAxYrEwwqNcbCYwpG-kxN_QqBePWq8C5a-ANs);
