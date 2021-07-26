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

async function main(downloader, userMode, query, options = {}) {
    const {dirname, eventEmitter} = downloader
    // Make sure useMobile is always a boolean
    options.useMobile = !!options.useMobile
    const {numberToDownload, useMobile} = options

    eventEmitter.emit("onInit", {userMode, query, ...options, date: new Date()})

    async function download(gfycats, useMobile, index = 0) {
        try {
            const length = numberToDownload || gfycats.length
            if (index !== length) {
                // Extract gfy info/meta
                const gfycat = gfycats[index]
                const {gfyName: name, views, likes, dislikes, userName: user} = gfycat
                const url = useMobile ? gfycat.mobileUrl : gfycat.mp4Url
                const size = useMobile ? gfycat.content_urls.mobile.size : gfycat.content_urls.mp4.size
                const finalPath = path.join(dirname, `/${query || "trending"}/${name}.mp4`)
                const meta = {dislikes, likes, name, size, user, url, views}
                meta.sizeMB = Math.round(size / 1048576)
                const info = {...meta, date: new Date()}

                if (fs.existsSync(finalPath)) {
                    eventEmitter.emit("onFileDownloadSkip", info)
                    download(gfycats, useMobile, index + 1)
                } else {
                    // Writer setup
                    const writer = fs.createWriteStream(finalPath)
                    writer.on("close", () => {
                        eventEmitter.emit("onFileDownloadFinish", info)
                        download(gfycats, useMobile, index + 1)
                    })
                    eventEmitter.emit("onFileDownloadStart", info)
                    // Download mp4 and write it to a file
                    axios.get(url, {responseType: "stream"})
                        .then(async response => {
                            response.data.pipe(writer)
                        })
                }
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
            download(gfycats, useMobile, index + 1) // Continue downloading
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
        download(gfycats, useMobile)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}
