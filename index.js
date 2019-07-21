const robots = {
    Locale: require('./Robots/locale.js'),
    News: require('./Robots/news.js'),
    Weather: require('./Robots/weather.js'),
    Traffic: require('./Robots/traffic.js'),
    State: require('./Robots/state.js'),
    Music: require('./Robots/music.js'),
    Speech: require('./Robots/speech.js')
}


async function start() {
    const mainData = {};

    mainData.maxCities = 3;
    await robots.Locale();
    await robots.Weather();
    await robots.News();
    await robots.Music();
    await robots.Speech();

}
start();