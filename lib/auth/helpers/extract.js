// Copyright https://github.com/dwyl/hapi-auth-jwt2/blob/master/lib/extract.js

const Cookie = require('cookie') // highly popular decoupled cookie parser

/**
 * customOrDefaultKey is a re-useable method to determing if the developer
 * using the plugin has defined a custom key for extractin the JWT
 * @param {Object} options - the options passed in when registering the plugin
 * @param {String} key - name of the key e.g `urlKey` see: https://git.io/vXbJN
 * @param {String} _default - the default key used if no custom is defined.
 * @returns {String} key - the custom key or default key.
 */
const customOrDefaultKey = (options, key, _default) => {
  return options[key] === false || typeof options[key] === 'string'
    ? options[key]
    : _default
}

/**
 * Extract the JWT from URL, Auth Header or Cookie
 * @param {Object} request - standard hapi request object inclduing headers
 * @param {Object} options - the configuration options defined by the person
 * using the plugin. this includes relevant keys. (see docs in Readme)
 * @returns {String} token - the raw JSON Webtoken or `null` if invalid
 */
const extractToken = (request, options = {}) => {
  // The key holding token value in url or cookie defaults to token
  let auth
  let token
  const cookieKey = customOrDefaultKey(options, 'cookieKey', 'token')
  const headerKey = customOrDefaultKey(options, 'headerKey', 'authorization')
  const urlKey = customOrDefaultKey(options, 'urlKey', 'token')
  const pattern = new RegExp(options.tokenType + '\\s+([^$]+)', 'i')

  if (urlKey && request.query && request.query[urlKey]) {
    // tokens via url: https://github.com/dwyl/hapi-auth-jwt2/issues/19
    auth = request.query[urlKey]
  } else if (headerKey && request.headers && request.headers[headerKey]) {
    if (typeof options.tokenType === 'string') {
      token = request.headers[headerKey].match(pattern)
      auth = token === null ? null : token[1]
    } else {
      auth = request.headers[headerKey]
    } // JWT tokens in cookie: https://github.com/dwyl/hapi-auth-jwt2/issues/55
  } else if (cookieKey && request.headers && request.headers.cookie) {
    auth = Cookie.parse(request.headers.cookie)[cookieKey]
  }

  // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
  return auth ? auth.replace(/Bearer/gi, '').replace(/ /g, '') : null
}

module.exports = { extractToken }
