const axios = require("axios")
const fs = require("fs")
const path = require("path")
const readline = require("readline");

const instance = axios.create({
    baseURL: "https://api.redgifs.com/v1",
    timeout: 10000,
})

module.exports.downloadUser = (query, dirname, fileCount) => {
    main(true, query, dirname, fileCount)
}
module.exports.downloadQuery = (query, dirname, fileCount) => {
    main(false, query, dirname, fileCount)
}

const userCount = 100
const userEndpoint = "users/$user/gfycats?count=$count"
const searchCount = 150
const searchEndpoint = "gfycats/search?search_text=$search&count=$count&order=trending"

async function main(userMode, query, dirname, fileCount) {
    console.log({userMode, query, dirname, fileCount})

    async function download(gfycats, index = 0) {
        const length = fileCount || gfycats.length
        if (index !== length) {
            const gfycat = gfycats[index]
            const {gfyName: name, mp4Url} = gfycat
            const size = gfycat.content_urls.mp4.size
            const finalPath = path.join(dirname, `/${query ? query : "trending"}/${name}.mp4`)

            const writer = fs.createWriteStream(finalPath)
            writer.on("close", () => {
                download(gfycats, index + 1)
            })

            console.log(`(${index + 1}/${gfycats.length}) Downloading ${name} - ${Math.round(size/1000000)} MB`)
            axios.get(mp4Url, {responseType: "stream"})
                .then(async response => {
                    response.data.pipe(writer)
                })
        } else {
            console.log("Finished!")
            process.exit()
        }
    }

    const gfycats = []
    try {
        async function getLinks(cursor) {
            if (userMode) {
                if (gfycats.length === 0) {
                    const data = (await instance.get(userEndpoint.replace("$user", query).replace("$count", userCount))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$user", query).replace("$count", userCount) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            } else {
                if (gfycats.length === 0) {
                    const data = (await instance.get(searchEndpoint.replace("$search", query).replace("$count", searchCount))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    console.log(searchEndpoint.replace("$search", query).replace("$count", searchCount))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$search", query).replace("$count", searchCount) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            }
        }

        await getLinks()

        try {
            fs.mkdirSync(path.join(dirname, `/${query || "trending"}`))
        } catch (e) {}

        console.log("Base file path:", dirname)
        console.log("Files to download:", gfycats.length)
        download(gfycats)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}
