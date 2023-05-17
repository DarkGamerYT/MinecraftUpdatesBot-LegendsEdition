const fs = require( "node:fs" );
const axios = require( "axios" );
const Config = require( "../config.json" );
const Utils = require( "../utils.js" );
const articleSections = {
	LegendsRelease: 15257946888973,
};

module.exports = class {
    constructor( client ) {
        setInterval(
            () => {
                axios(
                    {
                        url: "https://help.minecraft.net/help_center/en-us/articles?per_page=100",
                        method: "GET",
                    },
                ).then(
                    async ({ data }) => {
                        try {
                            const latestLegendsRelease = data.articles.find((a) => a.section_id == articleSections.LegendsRelease);
                            const legendsReleases = await Utils.getSavedData(
                                data.articles.filter(
                                    (a) => a.section_id == articleSections.LegendsRelease
                                ).map( Utils.formatArticle ),
                                articleSections.LegendsRelease,
                            );
                            
                            if (!legendsReleases.find((a) => a.article.id == latestLegendsRelease?.id)) {
                                const version = Utils.getVersion( latestLegendsRelease.name );
                                const thumbnail = Utils.extractImage( latestLegendsRelease.body );
                                
                                createPost( client, latestLegendsRelease, version, thumbnail, Config.tags.Stable, articleSections.BedrockPreview, false );
                                console.log(
                                    "\n\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[32m\x1B[1m[NEW RELEASE] \x1B[0m- ", latestLegendsRelease.name
                                );

                                legendsReleases.push(Utils.formatArticle( latestLegendsRelease ));
                                await new Promise((res) => setTimeout(() => res(), 1500));
                            };

                            fs.writeFileSync( "./data/stable-articles.json", JSON.stringify( legendsReleases.sort((a, b) => new Date(b.article.updated_at).getTime() - new Date(a.article.updated_at).getTime()), null, 4 ) );
                        } catch(e) {
                            console.log(e);
                        };
                    },
                );
            },
            Config.repeateInterval,
        );
    };
};

const createPost = (
    client,
    article,
    version,
    thumbnail,
    tag,
    articleSection,
) => {
    if (Config.legendsDisabled) return;

    const embed = Utils.createEmbed( article, thumbnail );
    const forumChannel = client.channels.cache.get( Config.forums.legends );
    forumChannel.threads.create(
        {
            name: (
                version
                + " - Stable"
            ),
            message: {
                embeds: [
                    embed,
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: "Changelog",
                                url: article.html_url,
                                emoji: {
                                    id: "1090311574423609416",
                                    name: "changelog",
                                },
                            },
                        ],
                    },
                ],
            },
            appliedTags: [ tag ],
        },
    ).then(
        (post) => {
            post.messages.cache.get( post.lastMessageId ).pin()
            .then(
                () => console.log(
                    "\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[32m\x1B[1m[SUCCESS] \x1B[0m- Successfully pinned the message for " + article.name
                ),
            ).catch(
                () => {
                    console.log(
                        "\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[31m\x1B[1m[ERROR] \x1B[0m- Failed to pin the message for " + article.name
                    );

                    post.send(
                        {
                            content: "> Failed to pin the message :[",
                        },
                    );
                },
            );
        },
    ).catch(
        () => {
            console.log(
                "\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[INFO] \x1B[0m- Failed to create the forum post for " + article.name + ", retrying..."
            );
        
            setTimeout(
                () => createPost( client, article, version, thumbnail, tag, articleSection ),
                5000,
            );
        },
    );
};