const request = require( "request" );
const fs = require( "fs" );
const axios = require( "axios" );
const Utils = require( "./utils.js" );

const articleSections = {
	LegendsRelease: 15257946888973,
};

const saveChangelogs = () => {
	axios(
		{
			url: "https://help.minecraft.net/help_center/en-us/articles?per_page=100",
			method: "GET",
		},
	).then(
		async ({ data }) => {
			const releaseArticles = data.articles.filter(
				(a) => a.section_id == articleSections.LegendsRelease
			).map( Utils.formatArticle );

			fs.writeFileSync(
				"./data/stable-articles.json",
				JSON.stringify(
					releaseArticles,
					null,
					4,
				),
			);
		},
	);
};

saveChangelogs();
console.log(
	"\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[INFO] \x1B[0m- Saving changelogs..."
);