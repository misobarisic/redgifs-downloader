const axios = require("axios")
const fs = require("fs")
const path = require("path")
const EventEmitter = require('events')
const {getLinksMain,filter} = require("./links")

module.exports = {
    create,
    instance
}

class Downloader {
    constructor(dirname) {
        if (!dirname) throw(new Error("dirname constructor parameter must not be empty"))
        this.dirname = dirname
        this.eventEmitter = new EventEmitter()
    }

    addEventListener(type, listener) {
        return this.eventEmitter.on(type, listener)
    }

    downloadUser(query, options) {
        return main(this, true, query, options)
    }

    downloadQuery(query, options) {
        return main(this, false, query, options)
    }
}

function create(dirname) {return new Downloader(dirname)}
function instance(dirname) {return new Downloader(dirname)}

async function main(downloader, userMode, query, options) {
    const {dirname, eventEmitter} = downloader
    // Make sure isMobile is always a boolean
    options.isMobile = !!options.isMobile
    const {numberToDownload, isMobile} = options

    eventEmitter.emit("onInit", {userMode, query, ...options, date: new Date()})

    async function download(gfycats, isMobile, index = 0) {
        try {
            const length = numberToDownload || gfycats.length
            if (index !== length) {
                // Extract gfy info/meta
                const gfycat = gfycats[index]
                const {gfyName: name, views, likes, dislikes, userName: user} = gfycat
                const url = isMobile ? gfycat.mobileUrl : gfycat.mp4Url
                const size = isMobile ? gfycat.content_urls.mobile.size : gfycat.content_urls.mp4.size
                const finalPath = path.join(dirname, `/${query || "trending"}/${name}.mp4`)
                const meta = {dislikes, likes, name, size, user, url, views}

                // Writer setup
                const writer = fs.createWriteStream(finalPath)
                writer.on("close", () => {
                    eventEmitter.emit("onFileDownloadFinish", {...meta, date: new Date()})
                    download(gfycats, isMobile, index + 1)
                })

                eventEmitter.emit("onFileDownloadStart", {...meta, date: new Date()})
                // Download mp4 and write it to a file
                axios.get(url, {responseType: "stream"})
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
        // Wait until all links have been fetched
        await getLinksMain(gfycats, userMode, query, options)

        // Filter according to the options object
        gfycats = filter(gfycats, options)

        // Create write folder if not already present
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

        eventEmitter.emit("onGetLinks", {
            links: gfycats,
            date: new Date(),
            options
        })

        // Start downloading files one by one
        download(gfycats, isMobile)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}
