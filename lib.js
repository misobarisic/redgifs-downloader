const axios = require("axios")
const fs = require("fs")
const path = require("path")

module.exports.downloadUser = (query,{dirname,fileCount}) => {
    main(true,query,dirname,fileCount)
}
module.exports.downloadQuery = (query,{dirname,fileCount}) => {
    main(false,query,dirname,fileCount)
}

const instance = axios.create({
    baseURL: "https://api.redgifs.com/v1",
    timeout: 10000,
})

async function main(userMode, query,dirname = __dirname,fileCount) {
    const userSize = 100
    const userEndpoint = "users/$user/gfycats?count=$count"
    const searchSize = 150
    const searchEndpoint = "gfycats/search?search_text=$search&count=$count&order=trending"

    async function download(gfycats, index = 0) {
        const length = fileCount || gfycats.length
        if (index !== length) {
            const gfycat = gfycats[index]
            const {gfyName: name, mp4Url} = gfycat
            const size = gfycat.content_urls.mp4.size
            const finalPath = path.join(dirname, `/${query || "trending"}/${name}.mp4`)

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
            return "RedGIFs Downloader finished"
        }
    }

    const gfycats = []
    try {
        async function getLinks(cursor) {
            if (userMode) {
                if (gfycats.length === 0) {
                    const data = (await instance.get(userEndpoint.replace("$user", query).replace("$count", userSize))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$user", query).replace("$count", userSize) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            } else {
                if (gfycats.length === 0) {
                    const data = (await instance.get(searchEndpoint.replace("$search", query).replace("$count", searchSize))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$search", query).replace("$count", searchSize) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            }
        }

        await getLinks()

        try {
            fs.mkdirSync(path.join(dirname, `/${query || "trending"}`))
        } catch (e) {}

        console.log("Base file path:",dirname)
        console.log("Files to download:", gfycats.length)
        download(gfycats)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}
