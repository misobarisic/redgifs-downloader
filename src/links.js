const axios = require("axios")
const instance = axios.create({
    baseURL: "https://api.redgifs.com/v2/",
    timeout: 10000,
})
const instanceOld = axios.create({
    baseURL: "https://api.redgifs.com/v1/",
    timeout: 10000,
})

const userCount = 100
const userEndpoint = "users/$user/gfycats?count=$count"
const searchCount = 100
const searchEndpoint = "gifs/search?search_text=$search&count=$count&order=trending"

let pages = 500;
async function getLinksMain(gifs, userMode, query, options, page) {
    try {
        // stop fetching links if numberToDownload is exceeded
        // Default numberToDownload is 250
        const numberToDownload = options.numberToDownload || 250
        if (gifs.length >= numberToDownload) {
            return
        }
        if (page > pages) {
            return
        }

        let data
        if (userMode) {
            throw new Error("Fetching user specific gifs is currently not supported due to some API changes on RedGIFs' side.")
            if (gifs.length === 0) data = (await instanceOld.get(userMaker(query, userCount))).data
            if (page) data = (await instanceOld.get(`${userMaker(query, userCount)}&page=${page}`)).data
        } else {
            if (gifs.length === 0) data = (await instance.get(searchMaker(query, searchCount))).data
            if (page) data = (await instance.get(`${searchMaker(query, searchCount)}&page=${page}`)).data
        }

        await pushToGfyArray(data, gifs, userMode, query, options, getLinksMain)
    } catch (e) {
        console.log(e)
    }
}

async function getLinks(userMode, query, options = {}, page) {
    let gifs = []
    try {
        await getLinksMain(gifs, userMode, query, options, page)
    } catch (e) {
    }
    return filter(gifs, options)
}

async function getUserLinks(query, options, cursor) {
    return await getLinks(true, query, options, cursor)
}

async function getSearchLinks(query, options, page) {
    return await getLinks(false, query, options, page)
}


const pushToGfyArray = async (data, gifArray, userMode, query, options, callbackFn) => {
    if (userMode) {
        data.gfycats.forEach(gfy => gfyArray.push(gfy))
        await callbackFn(gfyArray, userMode, query, options, data.cursor)
    } else {
        let {gifs,page} = data
        pages = data.pages
        // Filter when inserting
        gifs = filter(gifs,options)
        gifs.forEach(gif => {
            // Don't push to array if limit has been reached
            if (gifArray.length < options.numberToDownload) gifArray.push(gif)
        })

        await callbackFn(gifArray, userMode, query, options, ++page)
    }

}

const filter = (gfycats, options) => {
    const {numberToDownload, useMobile} = options

    const minMaxOptionsConfig = ["likes", "dislikes", "views", "duration"]
    const minMaxOptions = []
    const minMaxMobileOptionsConfig = ["height", "width"]
    const minMaxMobileOptions = []
    const boolOptionsConfig = ["nsfw", "hasAudio"]
    const boolOptions = []

    const minMaxFunc = (option, arr) => {
        const min = options[`min${option[0].toUpperCase()}${option.slice(1)}`]
        const max = options[`max${option[0].toUpperCase()}${option.slice(1)}`]
        if (typeof min !== "undefined") arr.push({option, type: "min", value: min})
        if (typeof max !== "undefined") arr.push({option, type: "max", value: max})
    }

    minMaxOptionsConfig.forEach(option => {
        minMaxFunc(option, minMaxOptions)
    })

    minMaxMobileOptionsConfig.forEach(option => {
        minMaxFunc(option, minMaxMobileOptions)
    })

    boolOptionsConfig.forEach(option => {
        if (typeof options[option] !== "undefined") boolOptions.push({option, value: options[option]})
    })

    gfycats = gfycats.filter(gfycat => {
        let state = true
        // MinMaxOptions
        minMaxOptions.forEach(option => {
            if (option.type === "min") {
                state = state && gfycat[option.option] >= option.value
            } else if (option.type === "max") {
                state = state && gfycat[option.option] <= option.value
            }
        })
        // MinMaxMobileOptions
        minMaxMobileOptions.forEach(option => {
            if (option.type === "min") {
                state = state && useMobile ? gfycat.urls.sd[option.option] : gfycat.urls.hd[option.option] >= option.value
            } else if (option.type === "max") {
                state = state && useMobile ? gfycat.urls.sd[option.option] : gfycat.urls.hd[option.option] <= option.value
            }
        })
        // BoolOptions
        boolOptions.forEach(option => {
            state = state && option.value === gfycat[option.option]
        })
        return state
    })
    if (numberToDownload) gfycats = gfycats.slice(0, numberToDownload)
    return gfycats
}

const userMaker = (query, count) => userEndpoint.replace("$user", query).replace("$count", count)
const searchMaker = (query, count) => searchEndpoint.replace("$search", query).replace("$count", count)

module.exports = {
    getLinksMain,
    getUserLinks,
    getSearchLinks,
    filter
}
