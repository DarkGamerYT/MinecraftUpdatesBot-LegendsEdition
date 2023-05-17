const htmlParser = require( "node-html-parser" );
const fs = require( "node:fs" );
const articleSections = {
	LegendsRelease: 15257946888973,
};

module.exports = {
    getSavedData: async ( data, articleSection ) => {
        if (!fs.existsSync( "./data" ))
            fs.mkdirSync( "./data" );
            
        if (
            !fs.existsSync( "./data/stable-articles.json" )
        ) {
            fs.writeFile(
                "./data/stable-articles.json", 
                JSON.stringify( data, null, 4 ), 
                () => {},
            );
            
            return data;
        } else {
            return JSON.parse(fs.readFileSync( "./data/stable-articles.json" ));
        };
    },
    formatArticle: ( a ) => {
        const version = (
            a.name
                .replace( "Minecraft Legends - Update", "" )
                .replace( "Minecraft Legends - ", "" )
        );
        
        const parsed = htmlParser.parse( a.body );
        const imageSrc = parsed.getElementsByTagName( "img" )[0]?.getAttribute( "src" );
        const image = 
            imageSrc?.startsWith( "https://feedback.minecraft.net/hc/article_attachments/" )
                ? imageSrc 
                : null;
    
        return {
            version,
            thumbnail: image,
            article: {
                id: a.id,
                url: a.html_url,
                title: a.title,
                created_at: a.created_at,
                updated_at: a.updated_at,
                edited_at: a.edited_at,
            },
        };
    },
    getVersion: ( v ) => {
        return v
            .replace( "Minecraft Legends - Update", "" )
            .replace( "Minecraft Legends - ", "" )
    },
    extractImage: ( body ) => {
        const parsed = htmlParser.parse( body );
        const imageSrc = parsed.getElementsByTagName( "img" )[0]?.getAttribute( "src" );
        const image = 
            imageSrc?.startsWith( "https://feedback.minecraft.net/hc/article_attachments/" )
                ? imageSrc
                : null;

        return image;
    },
    createEmbed: ( article, image ) => {
        return {
			title: article.name,
			url: article.html_url,
			color: 4652839,
			description: ">>> A new release of Minecraft Legends is out now!",
			author: {
				name: "Minecraft Legends Patch Notes",
				url: "https://help.minecraft.net/hc/en-us/sections/15257946888973",
				icon_url: "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
			},
			thumbnail: {
				url: "https://cdn.discordapp.com/attachments/1071081145149689857/1108436633713393767/mclegends.png",
			},
			image: {
				url: image,
			},
			footer: {
				text: "Posted on"
			},
			timestamp: article.updated_at,
		};
    },
};