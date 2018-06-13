/**
 * The api key used to access the key-value store.
 */
const API_KEY = "6j53rw48JGXahZAhrEWKm9U85Ky2SVZt";

/**
 * Writes an object or string to the key-value store.
 * @param {string} apiKey api key
 * @param {string} key data key to write
 * @param {object|object[]|string} value value to write
 */
async function putByKey(apiKey, key, value) {
    try {
        let resp = await fetch(`https://kv.quillaja.net/api/${apiKey}/${key}/`, {
            method: "PUT",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "value": JSON.stringify(value) }) // data can be `string` or {object}!
        });
        if (resp.ok) {
            let data = await resp.json();
            return data;
        } else {
            throw new Error("putByKey() response not ok. " + resp.status);
        }
    } catch (err) {
        console.error("putByKey() failed: " + err);
        return null;
    }
}

/**
 * Gets data from the key-value store.
 * @param {string} apiKey the api key
 * @param {string} key data key to retrieve
 * @returns {Promise<any>} data
 */
async function getByKey(apiKey, key) {
    try {
        let resp = await fetch(`https://kv.quillaja.net/api/${apiKey}/${key}/`, {
            method: "GET",
            mode: "cors",
            headers: { "Content-Type": "application/json" }
        });
        if (resp.ok) {
            let j = await resp.json();
            return JSON.parse(j["value"]);
        } else {
            throw new Error("getByKey() response not ok. " + resp.status);
        }
    } catch (err) {
        console.error("getByKey() failed: " + err);
        return null;
    }
}