const iplocation = require("iplocation").default;
const axios = require('axios');
const state = require('./state.js');

async function Robot() {

    const mainData = state.load();
    await fetchPublicIP(mainData);
    await fetchCountryByIP(mainData);
    await fetchMajorCitiesByCountry(mainData);

    state.save(mainData);

    async function fetchPublicIP(mainData) {


        const url = 'http://icanhazip.com/';

        await axios(url)
            .then((res) => {
                const rawData = res.data;
                try {
                    //console.log(rawData);
                    mainData.pubclicIP = rawData.replace(/[\n\r]+/g, '');;

                } catch (error) {
                    console.error(error);
                }
            })
            .catch((error) => {
                console.error(error);
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
        //console.log(url);
        await axios(url)
            .then((res) => {
                const rawData = res.data;
                try {
                    //console.log(rawData);
                    var cityData = rawData.records;
                    cityData = cityData.slice(0, mainData.maxCities);
                    mainData.majorCities = cityData.map((item) => {
                        return {
                            "city": item.fields.city,
                            "latitude": item.fields.latitude,
                            "longitude": item.fields.longitude
                        }
                    });
                    //console.log(mainData.majorCities);
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((error) => {
                console.error(error);
            })

    }
}

module.exports = Robot