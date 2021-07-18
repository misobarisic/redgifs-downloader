const lib = require("./lib")
const links = require("./links")

module.exports = lib
module.exports.create = lib.create
module.exports.instance = lib.instance
module.exports.getUserLinks = links.getUserLinks
module.exports.getSearchLinks = links.getSearchLinks

