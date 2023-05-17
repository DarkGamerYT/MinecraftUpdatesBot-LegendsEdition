const { SlashCommandBuilder } = require( "discord.js" );
const fs = require( "node:fs" );
const stableArticles = JSON.parse(fs.readFileSync( "./data/stable-articles.json" )).filter((a, index) => index < 25);
module.exports = {
	data: new SlashCommandBuilder()
		.setName( "changelog" )
		.setDescription( "Returns the changelog of a certain Minecraft Legends version" )
        .addSubcommand(
            (subcommand) =>
                subcommand
                .setName( "stable" )
                .setDescription( "Stable changelogs!" )
                .addStringOption(
                    (option) =>
                        option
                        .setName( "version" )
                        .setDescription( "Minecraft Legends Version" )
                        .setRequired(true)
                        .addChoices(
                            ...stableArticles.map(
                                (a) => (
                                    {
                                        name: a.version,
                                        value: a.version,
                                    }
                                ),
                            ),
                        )
                )
        ),

	async execute( interaction ) {
        try {
            const version = interaction.options.getString( "version" );
            console.log(
                "\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[DEBUG] \x1B[0m- " + interaction.user.tag + " (" + interaction.user.id + ") requested the changelog for the version " + version
            );

            await interaction.deferReply({ ephemeral: true });
            switch(interaction.options.getSubcommand()) {
                case "stable":
                    const stable = stableArticles.find(
                        (a) => a.version == version,
                    );

                    await interaction.editReply(
                        {
                            ephemeral: true,
                            content: "(This command is experimental and might get removed in the future!)",
                            embeds: [
                                {
                                    title: stable.article.title,
                                    url: stable.article.url,
                                    color: 4652839,
                                    description: `>>> **Released on**: <t:${new Date(stable.article.updated_at).getTime() / 1000}:f> (<t:${new Date(stable.article.updated_at).getTime() / 1000}:R>)`,
                                    author: {
                                        name: "Minecraft Legends Patch Notes",
                                        url: "https://help.minecraft.net/hc/en-us/sections/15257946888973",
                                        icon_url: "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
                                    },
                                    thumbnail: {
                                        url: "https://cdn.discordapp.com/attachments/1071081145149689857/1108436633713393767/mclegends.png",
                                    },
                                    image: {
                                        url: stable.thumbnail,
                                    },
                                },
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 5,
                                            label: "Changelog",
                                            url: stable.article.url,
                                            emoji: {
                                                id: "1090311574423609416",
                                                name: "changelog",
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    );
                break;
            };
        } catch(e) {};
	},
};