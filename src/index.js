'use strict'

const dt2js = require('./dt2js')
const js2dt = require('./js2dt')

module.exports.dt2js = dt2js.dt2js
module.exports.dt2js.setBasePath = dt2js.setBasePath
module.exports.js2dt = js2dt.js2dt
module.exports.js2dt.setBasePath = js2dt.setBasePath
