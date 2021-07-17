<h1 align="center">Welcome to RedGIFs Downloader 👋</h1>
<p>
  <a href="https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>
This is a simple command line utiliy which allows you to download all videos from any user or search term on RedGIFs. Enjoy yourselves!

## Usage

Requires `nodejs` and `npm`

1. Clone this repo and run `npm i` followed by `npm start` or `node cli.js`

2. Install this package locally with `npm i redgifs-downloader` or globally with `npm i redgifs-downloader -g`

```javascript
const RedgifsDownloader = require("redgifs-downloader")
const downloader = new RedgifsDownloader(__dirname)

downloader.downloadQuery("juicy")
downloader.downloadUser("your favourite user's id")
```

3. EventListeners and more
```javascript
const RedgifsDownloader = require("redgifs-downloader")
const downloader = new RedgifsDownloader(__dirname) // Replace __dirname with your prefered directory of choice

// EventListeners
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

downloader.downloadQuery("juicy", options)
```

4. Standalone Links API

```javascript
const RedgifsDownloader = require("redgifs-downloader")
// 1
RedgifsDownloader.getUserLinks("your favourite user's id", {numberToDownload: 2}).then(console.log)
//2
const links = await RedgifsDownloader.getSearchLinks("juicy", {minLikes: 3})
```

### Options object structure

| Field |  Data type  | Description |
|:-----|:--------:|------:|
| minLikes  | number | Minimum amount of likes |
| minViews  | number | Minimum amount of views |
| minDuration   |  number  |   Minimum gfy duration in seconds |
| maxDuration   |  number  |   Maximum gfy duration in seconds |
| numberToDownload   |  number  |   Max amount of gfycats to download |

## Author

👤 **Mišo Barišić**

* Website: https://www.misobarisic.com
* GitHub: [@misobarisic](https://github.com/misobarisic)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [misobarisic](https://github.com/misobarisic).<br />
This project is [MIT](https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE) licensed.
