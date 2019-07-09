const http = require('http');
const iplocation = require("iplocation").default;
const newsapiKey = require('./Credentials/newsapi.json').APIKey;
const openWeatherapiKey = require('./Credentials/openWeather.json').APIKey;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsapiKey);
const state = require('./state.js');

async function start() {
    const mainData = {};

    mainData.maxCities = 3;

    await fetchPublicIP(mainData);
    await fetchCountryByIP(mainData);
    await fetchMajorCitiesByCountry(mainData);
    await fetchNewsForCountry(mainData);
    await fetchWeatherForMajorCities(mainData);
    await fetchTrendMusic(mainData);

    state.save(mainData);

    console.dir(mainData, { deepest: null });

    async function fetchPublicIP(mainData) {
        return new Promise((resolve, reject) => {
            http.get('http://icanhazip.com/', (res) => {
                if (res.statusCode == 200) {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            //console.log(rawData);
                            mainData.pubclicIP = rawData.replace(/[\n\r]+/g, '');;
                            resolve();
                        } catch (e) {
                            reject(e.message);
                        }
                    });
                } else {
                    res.resume();
                    reject(res.statusCode);
                }
            })
        })
    }

    async function fetchCountryByIP(mainData) {
        //console.log(mainData.pubclicIP)
        const result = await iplocation(mainData.pubclicIP);
        mainData.geoIPData = result;
        return result;
    }

    async function fetchMajorCitiesByCountry(mainData) {
        const url = `http://public.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop&sort=population&facet=country&refine.country=${mainData.geoIPData.countryCode.toLowerCase()}`;
        // console.log(url);
        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                if (res.statusCode == 200) {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            //console.log(rawData);
                            var cityData = JSON.parse(rawData).records;
                            cityData = cityData.slice(0, mainData.maxCities);
                            mainData.majorCities = cityData.map((item) => {
                                return {
                                    "city": item.fields.city,
                                    "latitude": item.fields.latitude,
                                    "longitude": item.fields.longitude
                                }
                            });
                            resolve();
                        } catch (e) {
                            reject(e.message);
                        }
                    });
                } else {
                    res.resume();
                    reject(res.statusCode);
                }
            })
        })
    }

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

    async function fetchWeatherForMajorCities(mainData) {
        // mainData = state.load();        
        for (let index = 0; index < mainData.majorCities.length; index++) {
            const city = mainData.majorCities[index];
            const cityWeather = await fetchCityWeather(city)
            mainData.majorCities[index].weather = cityWeather;
        }
    }


    async function fetchCityWeather(majorCity) {
        return new Promise((resolve, reject) => {
            const url = `http://api.openweathermap.org/data/2.5/weather?q=${majorCity.city}&appid=${openWeatherapiKey}`;
            // console.log(url);
            http.get(url, (res) => {
                if (res.statusCode == 200) {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            const tempData = JSON.parse(rawData);
                            const tempC = tempData.main.temp - 273.15;
                            const tempF = tempC * (9 / 5) + 32;
                            const temp_minC = tempData.main.temp_min - 273.15;
                            const temp_minF = temp_minC * (9 / 5) + 32;
                            const temp_maxC = tempData.main.temp - 273.15;
                            const temp_maxF = temp_maxC * (9 / 5) + 32;
                            const record = {
                                    "city": majorCity.city,
                                    "temp": tempData.main.temp,
                                    "tempC": tempC.toFixed(2),
                                    "tempF": tempF.toFixed(2),
                                    "temp_min": tempData.main.temp_min,
                                    "temp_minC": temp_minC.toFixed(2),
                                    "temp_minF": temp_minF.toFixed(2),
                                    "temp_maxC": temp_maxC.toFixed(2),
                                    "temp_maxF": temp_maxF.toFixed(2),
                                    "temp_max": tempData.main.temp_max,
                                    "desc": tempData.weather.map(item => { return item.description })
                                }
                                //  console.log(record);
                            resolve(record);
                        } catch (error) {
                            reject(error);
                        }
                    })
                } else {
                    res.resume();
                    reject()
                }
            })
        })

    }

}
start();