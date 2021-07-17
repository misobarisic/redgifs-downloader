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
    console.log("[onGetData]", info)
})

// downloader.downloadUser("ashleyxoxxxox", {numberToDownload: 2,minViews: 100, minLikes: 5,maxDuration: 5})
// downloader.downloadQuery("oiled ass", {numberToDownload: 2,minViews: 50})
