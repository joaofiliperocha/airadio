const axios = require('axios');
const cheerio = require('cheerio');
const state = require('./state.js');

async function Robot() {
    const mainData = state.load();

    await fetchTrendMusic(mainData);

    state.save(mainData);

    async function fetchTrendMusic(mainData) {
        //mainData = state.load();
        var country = 'global';
        if (mainData && mainData.geoIPData && mainData.geoIPData.country) {
            country = mainData.geoIPData.country.toLowerCase();
        }
        const url = `https://spotifycharts.com/regional/${country}/daily/latest`;
        //  console.log(url);
        await axios(url)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html)
                const statsTable = $('.chart-table > tbody > tr');
                //console.log(statsTable.length);
                const musicTracks = [];
                for (let i = 0; i < 12; i++) {
                    const item = statsTable[i];
                    const trackUrl = $(item).find('.chart-table-image > a').attr('href');
                    //console.log(trackUrl);
                    const trackImage = $(item).find('.chart-table-image > a > img').attr('src');
                    const track = $(item).find('.chart-table-track > strong').text();
                    const artist = $(item).find('.chart-table-track > span').text();
                    // console.log(musicTracks);
                    musicTracks.push({
                        "trackUrl": trackUrl,
                        "trackImage": trackImage,
                        "trackName": track,
                        "artist": artist
                    });


                }

                mainData.musicTracks = musicTracks;
            })
            .catch(error => {
                console.log(error);
            });


    }

}

module.exports = Robot
