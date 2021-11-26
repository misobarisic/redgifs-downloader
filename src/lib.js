const axios = require("axios")
const fs = require("fs")
const path = require("path")
const EventEmitter = require('events')
const {getLinksMain, filter} = require("./links")

module.exports = {
    create,
    instance
}

class Downloader {
    constructor(dirname) {
        if (!dirname) throw(new Error("dirname constructor parameter must not be empty"))
        this.dirname = dirname
        this.isDownloading = false
        this.eventEmitter = new EventEmitter()
    }

    addEventListener(type, listener) {
        return this.eventEmitter.on(type, listener)
    }

    downloadUser(query, options) {
        main(this, true, query, options)
    }

    downloadQuery(query, options) {
        main(this, false, query, options)
    }

}

function create(dirname) {
    return new Downloader(dirname)
}

function instance(dirname) {
    return new Downloader(dirname)
}

async function main(downloader, userMode, query, options = {}) {
    const {dirname, eventEmitter} = downloader
    // Make sure useMobile & skipExisting is always a boolean
    options.useMobile = !!options.useMobile
    options.skipExisting = !!options.skipExisting
    const {numberToDownload, useMobile, skipExisting} = options

    eventEmitter.emit("onInit", {userMode, query, ...options, date: new Date()})

    async function download(gfycats, useMobile, index = 0) {
        // if (downloader.shouldStop) {
        //     this.shouldStop = false
        //     this.isDownloading = false
        //     eventEmitter.emit("onStop", {
        //         availableFiles: gfycats.length,
        //         date: new Date(),
        //         numberToDownload: numberToDownload || "not specified",
        //         query,
        //         userMode
        //     })
        //     return
        // }
        try {
            if (!(index === numberToDownload || index === gfycats.length)) {
                downloader.isDownloading = true
                // Extract gfy info/meta
                const gfycat = gfycats[index]

                // Remove gfy from array if undefined and start from the next one
                if (!gfycat) {
                    const cats = []
                    let tmpIndex = 0
                    gfycats.forEach(g => {
                        if (tmpIndex !== index) cats.push(g)
                    })
                    return download(gfycats, useMobile, index)
                }

                const {id: name, views, likes, dislikes, userName: user} = gfycat
                const url = useMobile ? gfycat.urls.sd : gfycat.urls.hd
                const finalPath = path.join(dirname, `/${query || "trending"}${useMobile ? " mobile" : ""}/${userMode ? name : `${user} - ${name}`}.mp4`)
                const meta = {dislikes, likes, name, user, url, views, index}
                const info = {...meta, date: new Date()}

                if (skipExisting && fs.existsSync(finalPath)) {
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
                        .catch(err => {
                            download(gfycats, useMobile, index + 1)
                        })
                }
            } else {
                downloader.isDownloading = false
                eventEmitter.emit("onFinish", {
                    availableFiles: gfycats.length,
                    date: new Date(),
                    numberToDownload: numberToDownload || "not specified",
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

        // Create write folder if not already present
        try {
            fs.mkdirSync(path.join(dirname, `/${query || "trending"}${useMobile ? " mobile" : ""}`))
        } catch (e) {
        }

        eventEmitter.emit("onStart", {
            availableFiles: gfycats.length,
            date: new Date(),
            numberToDownload: numberToDownload || "not specified",
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

    downloader.isDownloading = false

}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
