const axios = require('axios');
const state = require('./state.js');
const openWeatherapiKey = require('../Credentials/openWeather.json').APIKey;

async function Robot() {
    const mainData = state.load();
    await fetchWeatherForMajorCities(mainData);
    state.save(mainData);
    //console.log(mainData);
    async function fetchWeatherForMajorCities(mainData) {

        for (let index = 0; index < mainData.majorCities.length; index++) {
            const city = mainData.majorCities[index];
            await fetchCityWeather(city)
            //mainData.majorCities[index].weather = cityWeather;
        }
    }

    async function fetchCityWeather(majorCity) {

        const url = `http://api.openweathermap.org/data/2.5/weather?q=${majorCity.city}&appid=${openWeatherapiKey}`;
        //console.log(url);
        await axios(url)
            .then((res) => {
                const rawData = res.data;

                try {
                    const tempData = rawData;
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
                    // console.log(record);
                    majorCity.weather = record;
                }
                catch (error) {
                    console.error(error);
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }
}



module.exports = Robot 
