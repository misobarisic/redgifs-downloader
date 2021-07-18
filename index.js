// const RedgifsDownloader = require("./src/")
const RedgifsDownloader = require("./dist/lib")

console.log({RedgifsDownloader})

const downloader = RedgifsDownloader.instance(__dirname)
downloader.addEventListener("onInit", info => {
    console.log("[onInit]", info)
})
downloader.addEventListener("onStart", info => {
    console.log("[onStart]", info)
})
downloader.addEventListener("onFinish", info => {
    console.log("[onFinish]", info)
})
downloader.addEventListener("onFileDownloadStart", info => {
    console.log("[onFileDownloadStart]", info)
})
downloader.addEventListener("onFileDownloadFinish", info => {
    console.log("[onFileDownloadFinish]", info)
})
downloader.addEventListener("onGetLinks", info => {
    console.log("[onGetLinks]", info)
})
downloader.addEventListener("onError", info => {
    console.log("[onError]", info)
})

// RedgifsDownloader.getSearchLinks("juicy",{minLikes:3}).then(console.log)
// downloader.downloadUser("ashleyxoxxxox", {numberToDownload: 1, minLikes: 2})
// downloader.downloadQuery("oiled ass", {numberToDownload: 1})
