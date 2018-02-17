require('babel-register')
require('babel-polyfill')

const { JSDOM } = require('jsdom')

const jsdom = new JSDOM('<body></body>')
const { window } = jsdom

global.window = window
global.document = window.document
global.navigator = {
  userAgent: 'node.js'
}
