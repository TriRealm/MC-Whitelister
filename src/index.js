const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { readdirSync } = require("fs");
const path = require('path');
require('dotenv').config();

const config = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
    ]
});
global.client = client;

const LOG_WEBHOOK_URL = 'PLACEHOLDER_LOG_WEBHOOK_URL';
const LOG_CHANNEL_ID = 'PLACEHOLDER_LOG_CHANNEL_ID';
const MainPath = path.resolve(__dirname);
const token = config.token;

client.commands = new Collection();
const rest = new REST({ version: '10' }).setToken(token);

// Load slash commands
const commands = [];
readdirSync(`${MainPath}/src/commands`).forEach(file => {
    const command = require(`./src/commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
});

// Utility: formatted timestamp
function getFormattedDateTime() {
    return new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });
}

const runWhitelistCheck = require("./src/utils/whitelistManager.js");

// 1️⃣ Handle Discord.js client errors
client.on('error', err => {
  console.error('Discord client error:', err);
});

// 2️⃣ Handle unhandled promise rejections globally
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err);
});

// 3️⃣ Handle uncaught exceptions globally (optional)
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});

// Heartbeat
function logHeartbeat() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false });
    console.log(`[${localTime}] ✅ ${client.user.username} is still online.`);
    scheduleNextPing();
}

function scheduleNextPing() {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const delay = nextHour.getTime() - now.getTime();

    setTimeout(() => {
        const check = new Date();
        if (check.getMinutes() === 0 && check.getSeconds() === 0) {
            logHeartbeat();
        } else {
            scheduleNextPing();
        }
    }, delay);
}

// Handle graceful shutdown
async function sendShutdownMessage() {
    try {
        const channel = await client.channels.fetch(LOG_CHANNEL_ID);
        if (!channel) return console.error('Log channel not found for shutdown message.');

        const now = getFormattedDateTime();
        await channel.send(`⚠️ **${client.user.username}** is shutting down...\n📅 \`${now}\``);
    } catch (err) {
        console.error('Error sending shutdown message:', err);
    }
}

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down...');
    await sendShutdownMessage();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔴 bot is Shutting Down');
    await sendShutdownMessage();
    process.exit(0);
});


// Unified 'ready' handler
client.once('clientReady', async () => {
    console.log(`🟢 ${client.user.username} is ready`);

    // Send online message to log channel
    const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (channel) {
        const now = getFormattedDateTime();
        await channel.send(`✅ **${client.user.username}** is now online!\n📅 \`${now}\``).catch(console.error);
    } else {
        console.error('Log channel not found');
    }

    // Register slash commands
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Commands Registered with Discord');
    } catch (error) {
        console.error('Slash command registration failed:', error);
    }

    // Preload all members for each guild
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.members.fetch();
            await sleep(2000); // prevent rate-limit
        } catch (err) {
            console.error(`❌ Failed to fetch members for ${guild.name}:`, err);
        }
    }
    console.log('✅ Member preloading complete for all guilds!');

    // Run whitelist check immediately once
    await runWhitelistCheck(client);

    // Schedule repeated whitelist checks every 5 minutes
    setInterval(() => {
        runWhitelistCheck(client);
    }, 5 * 60 * 1000);

    // Start heartbeat
    scheduleNextPing();
});


client.on("interactionCreate", async (interaction) => {
    console.log("🔹 interaction received:", interaction.type, interaction.commandName);
});


// Dynamic event loader
readdirSync('./src/events').forEach(file => {
    const event = require(`./src/events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

client.login(token);
