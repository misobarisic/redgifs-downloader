const axios = require("axios")
const fs = require("fs")
const path = require("path")
const readline = require("readline");

const instance = axios.create({
    baseURL: "https://api.redgifs.com/v1",
    timeout: 10000,
})

let userMode = true

let user
const userCount = 100
const userEndpoint = "users/$user/gfycats?count=$count"
let search
const searchCount = 150
const searchEndpoint = "gfycats/search?search_text=$search&count=$count&order=trending"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Type 1 to select user mode, type 2 to select search mode: ", input => {
    userMode = input === "1"
    if (userMode) {
        rl.question("User ID: ", input => {
            user = input
            main()
        })
    } else {
        rl.question("Search term (leave empty to download trending videos): ", input => {
            search = input
            main()
        })
    }
})

async function main() {
    async function download(gfycats, index = 0) {
        if (index !== gfycats.length) {
            const gfycat = gfycats[index]
            const {gfyName: name, mp4Url} = gfycat
            const size = gfycat.content_urls.mp4.size
            const finalPath = path.join(__dirname, `/${userMode ? user : search || "trending"}/${name}.mp4`)

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
                    const data = (await instance.get(userEndpoint.replace("$user", user).replace("$count", userCount))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$user", user).replace("$count", userCount) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            } else {
                if (gfycats.length === 0) {
                    const data = (await instance.get(searchEndpoint.replace("$search", search).replace("$count", searchCount))).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                    return
                }
                if (cursor) {
                    const data = (await instance.get(userEndpoint.replace("$search", search).replace("$count", searchCount) + `&cursor=${cursor}`)).data
                    data.gfycats.forEach(gfy => gfycats.push(gfy))
                    await getLinks(data.cursor)
                }
            }
        }

        await getLinks()

        try {
            fs.mkdirSync(path.join(__dirname, `/${userMode ? user : search || "trending"}`))
        } catch (e) {}

        console.log("Files to download:", gfycats.length)
        download(gfycats)
    } catch (e) {
        console.log("Something went wrong", e)
    }
}
