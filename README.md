<h1 align="center">Welcome to RedGIFs Downloader 👋</h1>
<p>
  <a href="https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
   </a> 
<a href="https://www.npmjs.com/package/redgifs-downloader" target="_blank">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/redgifs-downloader" />
   </a>
 <a href="https://www.npmjs.com/package/redgifs-downloader" target="_blank">
    <img alt="NPM latest" src="https://img.shields.io/npm/v/redgifs-downloader" />
   </a>
<a href="https://www.npmjs.com/package/redgifs-downloader" target="_blank">
    <img alt="NPM beta" src="https://img.shields.io/npm/v/redgifs-downloader/beta" />
   </a>
</p>

How many times have you wanted to download videos in bulk from [RedGIFs](https://www.redgifs.com/). Downloading videos
from your favourite user and any search term has never been easier!
Just follow the steps below and make sure to use filters to enhance your experience.

## Usage

Requires `nodejs` and `npm`. There are multiple ways you can use this downloader.
Install this package locally with `npm i redgifs-downloader` or globally with `npm i redgifs-downloader -g`

1. Recommended use case

#### Simple Approach

```javascript
const RedgifsDownloader = require("redgifs-downloader")
const downloader = RedgifsDownloader.create(__dirname)

downloader.downloadQuery("juicy")
downloader.downloadUser("your favourite user's id")
```

#### Advanced Approach

```javascript
const RedgifsDownloader = require("redgifs-downloader")
const downloader = RedgifsDownloader.instance(__dirname) // Replace __dirname with your prefered directory of choice

// EventListeners
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
downloader.addEventListener("onFileDownloadSkip", info => {
    console.log("[onFileDownloadSkip]", info)
})
downloader.addEventListener("onGetLinks", info => {
    console.log("[onGetLinks]", info)
})
downloader.addEventListener("onError", info => {
    console.log("[onError]", info)
})

downloader.downloadQuery("juicy", options)
// options object explained down below
```

2. Standalone Links API

```javascript
const RedgifsDownloader = require("redgifs-downloader")
//1
RedgifsDownloader.getUserLinks("your favourite user's id", {numberToDownload: 2}).then(console.log)
//2
const links = await RedgifsDownloader.getSearchLinks("juicy", {minLikes: 3})
```

### Options object structure

| Field |  Data type  | Description | Default |
|:-----|:--------:|:--------:|------:|
| minLikes  | number | Minimum amount of likes | undefined |
| maxLikes  | number | Maximum amount of likes | undefined |
| minDislikes  | number | Minimum amount of dislikes | undefined |
| maxDislikes  | number | Maximum amount of dislikes | undefined |
| minViews  | number | Minimum amount of views | undefined |
| maxViews  | number | Maximum amount of views | undefined |
| minDuration   |  number  |   Minimum gfy duration in seconds | undefined |
| maxDuration   |  number  |   Maximum gfy duration in seconds | undefined |
| minSize   |  number  |   Minimum gfy size in bytes | undefined |
| maxSize   |  number  |   Maximum gfy size in bytes | undefined |
| minHeight   |  number  |   Minimum height in pixels | undefined |
| maxHeight   |  number  |   Maximum height in pixels | undefined |
| minWidth   |  number  |   Minimum width in pixels | undefined |
| maxWidth   |  number  |   Maximum width in pixels | undefined |
| numberToDownload   |  number  |   Max amount of gfycats to download | 250 |
| nsfw   |  boolean  |   Whether gfy is tagged as "nsfw" | undefined |
| hasAudio   |  boolean  |   Whether gfy has audio | undefined |
| useMobile   |  boolean  |   Whether to use mobile urls instead of mp4 | false |
| skipExisting | boolean | Whether to skip redownloading already existing files | false

To save on storage space and bandwidth, make sure `useMobile` is truthy! If a file is malformed and cannot be properly played,
`skipExisting` does not care. It will always skip when there is a chance.

## Author

👤 **Mišo Barišić**

* Website: https://www.misobarisic.com
* GitHub: [@misobarisic](https://github.com/misobarisic)
* GitLab: [@misobarisic](https://gitlab.com/misobarisic)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [misobarisic](https://github.com/misobarisic).<br />
This project is [MIT](https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE) licensed.
