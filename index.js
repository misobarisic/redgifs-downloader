const {downloadQuery, downloadUser} = require("./lib/")
downloadQuery("ass", __dirname, 1)
    .on("start",() => {
        console.log("onStart")
    })
    .on("finish",(name,size,filePath) => {
    console.log("onFinish",{name,size,filePath})
})



// downloadUser("annamonik",__dirname,1)
