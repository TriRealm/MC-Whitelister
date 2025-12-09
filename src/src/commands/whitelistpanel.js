const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whitelist")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Post the whitelist panel in this channel"),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle("🔒 Minecraft Whitelist")
                .setDescription("Click the button below to whitelist your Minecraft account.\n\nYou may only whitelist **once**.")
                .setColor("#00AAFF");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("start_whitelist")
                    .setLabel("Whitelist")
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (err) {
            console.error("Slash command error:", err);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ An error occurred.", flags: MessageFlags.Ephemeral });
            }
        }
    }
};
