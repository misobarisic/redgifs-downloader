const axios = require("axios")
const instance = axios.create({
    baseURL: "https://api.redgifs.com/v1",
    timeout: 10000,
})

const userCount = 100
const userEndpoint = "users/$user/gfycats?count=$count"
const searchCount = 150
const searchEndpoint = "gfycats/search?search_text=$search&count=$count&order=trending"

async function getLinksMain(gfycats, userMode, query, options, cursor) {
    try {
        let data
        if (userMode) {
            if (gfycats.length === 0) data = (await instance.get(userMaker(query, userCount))).data
            if (cursor) data = (await instance.get(`${userMaker(query, userCount)}&cursor=${cursor}`)).data
        } else {
            if (gfycats.length === 0) data = (await instance.get(searchMaker(query, searchCount))).data
            if (cursor) data = (await instance.get(`${searchMaker(query, searchCount)}&cursor=${cursor}`)).data
        }
        await pushToGfyArray(data, gfycats, userMode, query, options, getLinksMain)
    } catch (e) {}
}

async function getLinks(userMode, query, options = {}, cursor) {
    let gfycats = []
    try {
        await getLinksMain(gfycats, userMode, query, options, cursor)
    } catch (e) {
    }
    return filter(gfycats, options)
}

async function getUserLinks(query, options, cursor) {
    return await getLinks(true, query, options, cursor)
}

async function getSearchLinks(query, options, cursor) {
    return await getLinks(false, query, options, cursor)
}

const pushToGfyArray = async (data, gfyArray, userMode, query, options, callbackFn) => {
    data.gfycats.forEach(gfy => gfyArray.push(gfy))
    await callbackFn(gfyArray, userMode, query, options, data.cursor)
}

const filter = (gfycats, options) => {
    const {numberToDownload, useMobile} = options

    const minMaxOptionsConfig = ["likes", "dislikes", "views", "duration"]
    const minMaxOptions = []
    const minMaxMobileOptionsConfig = ["height", "width", "size"]
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
                state = state && useMobile ? gfycat.content_urls.mobile[option.option] : gfycat.content_urls.mp4[option.option] >= option.value
            } else if (option.type === "max") {
                state = state && useMobile ? gfycat.content_urls.mobile[option.option] : gfycat.content_urls.mp4[option.option] <= option.value
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
