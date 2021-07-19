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
    const {
        minDuration,
        maxDuration,
        minLikes,
        maxDislikes,
        minViews,
        minSize,
        maxSize,
        numberToDownload,
        nsfw,
        hasAudio,
        useMobile,
        minHeight,
        maxHeight,
        minWidth,
        maxWidth
    } = options
    gfycats = gfycats.filter(gfycat => {
        let state = true
        if (minLikes && minViews) state = state && gfycat.likes >= minLikes && gfycat.views >= minViews
        if (minLikes) state = state && gfycat.likes >= minLikes
        if (maxDislikes) state = state && gfycat.dislikes <= maxDislikes
        if (minViews) state = state && gfycat.views >= minViews
        if (minDuration) state = state && gfycat.duration >= minViews
        if (maxDuration) state = state && gfycat.duration <= maxDuration
        if (minHeight) state = state && useMobile ? gfycat.content_urls.mobile.height : gfycat.content_urls.mp4.height >= minHeight
        if (maxHeight) state = state && useMobile ? gfycat.content_urls.mobile.height : gfycat.content_urls.mp4.height <= maxHeight
        if (minWidth) state = state && useMobile ? gfycat.content_urls.mobile.width : gfycat.content_urls.mp4.width >= minWidth
        if (maxWidth) state = state && useMobile ? gfycat.content_urls.mobile.width : gfycat.content_urls.mp4.width <= maxWidth
        if (minSize) state = state && useMobile ? gfycat.content_urls.mobile.size : gfycat.content_urls.mp4.size >= minSize
        if (maxSize) state = state && useMobile ? gfycat.content_urls.mobile.size : gfycat.content_urls.mp4.size <= maxSize
        if (typeof nsfw !== "undefined") state = state && nsfw === gfycat.nsfw
        if (typeof hasAudio !== "undefined") state = state && hasAudio === gfycat.hasAudio
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
