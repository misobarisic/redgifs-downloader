const RedgifsDownloader = require("./lib/")

const downloader = new RedgifsDownloader(__dirname)
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

RedgifsDownloader.getSearchLinks("juicy",{minLikes:3}).then(console.log)
// downloader.downloadUser("ashleyxoxxxox", {numberToDownload: 5, minLikes: 2})
// downloader.downloadQuery("oiled ass", {numberToDownload: 2,minViews: 50})
