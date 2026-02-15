const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');
// Move the require to the top for better performance (RiCK UND Dont Panic!!!Zeus will handle!!)
const ConditionChecker = require('../../utils/checks');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and disconnect from voice channel'),
    securityToken: COMMAND_SECURITY_TOKEN,

    async execute(interaction, client) {
        // 1. IMMEDIATELY defer the reply to stop the 3-second timer
        try {
            await interaction.deferReply();
        } catch (err) {
            return console.error("Could not defer interaction:", err);
        }

        // 2. Perform your core validation
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ System core offline - Command unavailable')
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [embed] }).catch(() => {});
        }

        interaction.shivaValidated = true;
        interaction.securityToken = COMMAND_SECURITY_TOKEN;

        const checker = new ConditionChecker(client);

        try {
            const conditions = await checker.checkMusicConditions(
                interaction.guild.id, 
                interaction.user.id, 
                interaction.member.voice?.channelId
            );

            // 3. Handle logic using editReply (since we deferred) (ReDefine BY Rick ser)
            if (!conditions.hasActivePlayer) {
                const embed = new EmbedBuilder().setDescription('❌ No music is currently playing!');
                return interaction.editReply({ embeds: [embed] })
                    .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 5000));
            }

            if (!conditions.sameVoiceChannel) {
                const embed = new EmbedBuilder().setDescription('❌ You need to be in the same voice channel as the bot!');
                return interaction.editReply({ embeds: [embed] })
                    .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 5000));
            }

            const player = conditions.player;
            if (player) {
                player.destroy();
            }

            const embed = new EmbedBuilder().setDescription('🛑 Music stopped and disconnected from voice channel!');
            return interaction.editReply({ embeds: [embed] })
                .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 5000));

        } catch (error) {
            console.error('Stop command error:', error);
            const embed = new EmbedBuilder().setDescription('❌ An error occurred while stopping music!');
            return interaction.editReply({ embeds: [embed] })
                .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 5000));
        }
    }
};
