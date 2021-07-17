<h1 align="center">Welcome to RedGIFs Downloader 👋</h1>
<p>
  <a href="https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>
This is a simple command line utiliy which allows you to download all videos from any user or search term on RedGIFs. Enjoy yourselves!

## Usage
1. Install this package locally `npm i redgifs-downloader` or globally `npm i redgifs-downloader -g` 
```javascript
const downloader = require("redgifs-downloader")

// user and dirname are mandatory, fileCount is optional
//downloader.downloadUser(userId,dirname,fileCount)
downloader.downloadUser(yourBelovedUser)

// query and dirname are mandatory, fileCount is optional
//downloader.downloadQuery(userId,dirname,fileCount)
downloader.downloadQuery("juicy", __dirname, 2)
```

2. Clone this repo and run `npm i` followed by `npm start` or `node cli.js`

## Author

👤 **Mišo Barišić**

* Website: https://www.misobarisic.com
* GitHub: [@misobarisic](https://github.com/misobarisic)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [misobarisic](https://github.com/misobarisic).<br />
This project is [MIT](https://github.com/misobarisic/redgifs-downloader/blob/master/LICENSE) licensed.
