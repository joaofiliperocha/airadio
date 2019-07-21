const text2scriptKey = require('../Credentials/text2speech.json').ApiKey;
const state = require('./state.js');


async function Robot() {
    const mainData = state.load();

    await createRadioScript(mainData);
    await readScript(mainData);

    state.save(mainData);


    async function createRadioScript(mainData) {

    }

    async function readScript(mainData) {

        const token = () => {
            let options = {
                method: 'POST',
                uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
                headers: {
                    'Ocp-Apim-Subscription-Key': text2scriptKey
                }
            }
            return rp(options);
        }



    }

}

module.exports = Robot
