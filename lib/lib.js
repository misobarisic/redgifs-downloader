const axios = require("axios")
const fs = require("fs")
const path = require("path")
const EventEmitter = require('events')

const instance = axios.create({
    baseURL: "https://api.redgifs.com/v1",
    timeout: 10000,
})

module.exports = class Downloader {
    constructor(dirname) {
        if (!dirname) throw(new Error("dirname constructor parameter must not be empty"))
        this.dirname = dirname
        this.eventEmitter = new EventEmitter()
    }

    addEventListener = (type, listener) => this.eventEmitter.on(type, listener)
    downloadUser = (query, options) => main(this, true, query, options)
    downloadQuery = (query, options) => main(this, false, query, options)

    config = {
        userCount: 100,
        userEndpoint: "users/$user/gfycats?count=$count",
        searchCount: 150,
        searchEndpoint: "gfycats/search?search_text=$search&count=$count&order=trending"
    }
    userMaker = (query, count) => this.config.userEndpoint.replace("$user", query).replace("$count", count)
    searchMaker = (query, count) => this.config.searchEndpoint.replace("$search", query).replace("$count", count)
}

async function main(downloader, userMode, query, options) {
    const {dirname, eventEmitter, userMaker, searchMaker} = downloader
    const {userCount, searchCount} = downloader.config
    const {minDuration, maxDuration, minLikes, minViews, numberToDownload} = options

    if (minDuration && maxDuration) throw(new Error("Make sure minDuration and maxDuration aren't both defined"))

    async function download(gfycats, index = 0) {
        try {
            const length = numberToDownload || gfycats.length
            if (index !== length) {
                const gfycat = gfycats[index]
                const {gfyName: name, mp4Url, views, likes, dislikes, userName: user} = gfycat
                const size = gfycat.content_urls.mp4.size
                const finalPath = path.join(dirname, `/${query || "trending"}/${name}.mp4`)
                const meta = {dislikes, likes, name, size, user, url: mp4Url, views}

                const writer = fs.createWriteStream(finalPath)
                writer.on("close", () => {
                    eventEmitter.emit("onFileDownloadFinish", {...meta, date: new Date()})
                    download(gfycats, index + 1)
                })

                eventEmitter.emit("onFileDownloadStart", {...meta, date: new Date()})
                axios.get(mp4Url, {responseType: "stream"})
                    .then(async response => {
                        response.data.pipe(writer)
                    })
            } else {
                eventEmitter.emit("onFinish", {
                    availableFiles: gfycats.length,
                    date: new Date(),
                    numberToDownload: numberToDownload,
                    query,
                    userMode
                })
            }
        } catch (error) {
            eventEmitter.emit("onError", {downloader, error})
        }
    }

    let gfycats = []
    try {
        async function getLinks(cursor) {
            if (userMode) {
                if (gfycats.length === 0) {
                    const data = (await instance.get(userMaker(query,userCount))).data
                    await pushToGfyArray(data,gfycats,getLinks)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userMaker(query, userCount) + `&cursor=${cursor}`)).data
                    await pushToGfyArray(data,gfycats,getLinks)
                }
            } else {
                if (gfycats.length === 0) {
                    const data = (await instance.get(searchMaker(query,searchCount))).data
                    await pushToGfyArray(data,gfycats,getLinks)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(searchMaker(query, searchCount) + `&cursor=${cursor}`)).data
                    await pushToGfyArray(data,gfycats,getLinks)
                }
            }
        }

        await getLinks()

        try {
            fs.mkdirSync(path.join(dirname, `/${query || "trending"}`))
        } catch (e) {
        }

        eventEmitter.emit("onStart", {
            availableFiles: gfycats.length,
            date: new Date(),
            numberToDownload: numberToDownload,
            query,
            userMode
        })

        gfycats = gfycats.filter(gfycat => {
            let state = true
            if (minLikes && minViews) state = state && gfycat.likes >= minLikes && gfycat.views >= minViews
            if (minLikes) state = state && gfycat.likes >= minLikes
            if (minViews) state = state && gfycat.views >= minViews
            if (minDuration) state = state && gfycat.duration >= minViews
            if (maxDuration) state = state && gfycat.duration <= maxDuration
            return state
        })
        if (numberToDownload) gfycats = gfycats.slice(0, numberToDownload)
        eventEmitter.emit("onGetLinks", {
            links: gfycats,
            date: new Date(),
            options
        })
        download(gfycats)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}

const pushToGfyArray = async (data,gfyArray,callbackFn) => {
    data.gfycats.forEach(gfy => gfyArray.push(gfy))
    await callbackFn(data.cursor)
}
