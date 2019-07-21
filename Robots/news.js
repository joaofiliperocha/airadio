const newsapiKey = require('../Credentials/newsapi.json').APIKey;
const state = require('./state.js');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsapiKey);

async function Robot() {
    const mainData = state.load();
    await fetchNewsForCountry(mainData);

    state.save(mainData);

    async function fetchNewsForCountry(mainData) {

        const result = newsapi.v2.topHeadlines({
            country: mainData.geoIPData.countryCode
        });

        await result.then(Response => {
            mainData.articles = Response.articles.map((item) => {
                return {
                    "content": item.title + " " + item.description
                }
            });
        })
    }
}

module.exports = Robot