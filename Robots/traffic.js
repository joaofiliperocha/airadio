const state = require('./state.js');
const hereKeys = require('../Credentials/here.json');

async function Robot() {
    const mainData = state.load();
    await fetchTrafficForMajorCities(mainData);

    state.save(mainData);

    async function fetchTrafficForMajorCities(mainData) {
        // mainData = state.load();
        for (let index = 0; index < mainData.majorCities.length; index++) {
            const city = mainData.majorCities[index];
            const cityTraffic = await getCityTraffic(city);
            mainData.majorCities[index].traffic = cityTraffic
        }

    }

    function getCityTraffic(cityData) {
        const url = `http://traffic.cit.api.here.com/traffic/6.3/incidents.json?prox=${cityData.latitude},${cityData.longitude},15000&criticality=0,1&maxresults=7&app_id=${hereKeys.AppID}&app_code=${hereKeys.AppCode}`
        //console.log(url);
        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                if (res.statusCode == 200) {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            const TRAFFIC_ITEMS = JSON.parse(rawData).TRAFFIC_ITEMS;
                            if (!TRAFFIC_ITEMS)
                                resolve([]);
                            const trafficDesc = TRAFFIC_ITEMS.TRAFFIC_ITEM.map((item) => {
                                const traffdesc = item.TRAFFIC_ITEM_DESCRIPTION.map((desc, idx) => {
                                    if (desc && idx == 1)
                                        return desc.value;
                                });
                                return traffdesc.filter((el) => { return el });
                            })
                            // console.log(trafficDesc);

                            resolve(trafficDesc);
                        } catch (error) {
                            reject(error);
                        }
                    })
                }
            })
        });
    }
}

module.exports = Robot 