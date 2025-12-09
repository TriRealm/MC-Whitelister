const fs = require("fs");
const path = require("path");
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, MessageFlags } = require("discord.js");
const { sendRconCommand } = require("../utils/rcon.js");

const storePath = path.join(__dirname, "..", "whitelistStore.json");

// Define allowed roles per guild (same as whitelistManager.js)
const allowedRoles = {
    "605777191325925387": [ // GUILD ID: The Hollow
        "1333055102323265577", // RoleID: Fledgelings
        "1333055102323265578",  // RoleID: Tier 1
        "1333055102323265579",  // RoleID: Tier 2
        "1333055102323265580",  // RoleID: Tier 3
        "605778471762788354",  // RoleID: V.I.P
        "1447006523606827115",  // RoleID: Game Access
        "1369095840534237204" // RoleID: Staff
        //"1367362877744349266" // RoleID: Testing Role
    ],

    "966171098821582868": [ // GUILD ID: The Aquarium
        "1159385479741968404", // RoleID: Twitch Subscriber
        "1159385479741968405",  // RoleID: Tier 1
        "1159385479741968410",  // RoleID: Tier 2
        "1159385481134481428",  // RoleID: Tier 3
        "966171964198756363",  // RoleID: Staff
        "1373916462418497578"  // RoleID: YouTube Member
        //"1374550283375480922" // RoleID: Testing Role
    ]
};

// Load store fresh from disk
function loadStore() {
    if (fs.existsSync(storePath)) {
        try {
            return JSON.parse(fs.readFileSync(storePath));
        } catch (err) {
            console.error("Failed to parse whitelistStore.json:", err);
            return {};
        }
    }
    return {};
}

// Save store to disk
function saveStore(store) {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        try {
            // --- SLASH COMMAND ---
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction);
                } catch (err) {
                    console.error(`Error executing command ${interaction.commandName}:`, err);
                    if (!interaction.replied) {
                        await interaction.reply({ content: "❌ An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
                    }
                }
                return;
            }

            // --- BUTTON CLICK ---
            if (interaction.isButton() && interaction.customId === "start_whitelist") {
                const guildId = interaction.guild.id;
                const userId = interaction.user.id;

                // reload store fresh
                let store = loadStore();

                // Check if user is already whitelisted
                if (store[guildId]?.[userId]) {
                    return interaction.reply({ content: "❌ You have already whitelisted.", flags: MessageFlags.Ephemeral });
                }

                // Check if user has any of the required roles
                const member = interaction.member;
                const rolesNeeded = allowedRoles[guildId] || [];

                const hasRole = member.roles.cache.some(r => rolesNeeded.includes(r.id));
                if (!hasRole) {
                    return interaction.reply({
                        content: "❌ You do not have any of the required roles to be whitelisted.",
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Show modal
                const modal = new ModalBuilder()
                    .setCustomId("wl_modal")
                    .setTitle("Minecraft Whitelist");

                const usernameInput = new TextInputBuilder()
                    .setCustomId("mcName")
                    .setLabel("Minecraft Username")
                    .setPlaceholder("e.g. Herobrine")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(usernameInput);
                modal.addComponents(row);

                return interaction.showModal(modal);
            }

            // --- MODAL SUBMIT ---
            if (interaction.isModalSubmit() && interaction.customId === "wl_modal") {
                const guildId = interaction.guild.id;
                const userId = interaction.user.id;
                const mcName = interaction.fields.getTextInputValue("mcName");

                let store = loadStore();

                if (!store[guildId]) store[guildId] = {};
                store[guildId][userId] = {
                    mcName,
                    timestamp: Date.now()
                };

                saveStore(store);

                await sendRconCommand(`whitelist add ${mcName}`);

                return interaction.reply({
                    content: `✅ You have been whitelisted as **${mcName}**.`,
                    flags: MessageFlags.Ephemeral
                });
            }

        } catch (err) {
            console.error("Interaction handler error:", err);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ An unexpected error occurred.", flags: MessageFlags.Ephemeral });
            }
        }
    }
};
