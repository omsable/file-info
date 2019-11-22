const fs = require('fs')
const https = require('https')
const path = require('path')
const xattr = require('fs-xattr')
const bplist = require('bplist-parser')
const fileType = require('file-type')

const getFileInfo = url => {
  return new Promise((resolve, reject) => {
    const info = {
      format: {},
      contentType: '',
      contentLength: 0,
      attributes: {}
    }

    // https://www.npmjs.com/package/music-metadata
    const filePath = path.resolve('/tmp/file.jpg')

    const request = https.get(url, async response => {
      await response.pipe(fs.createWriteStream(filePath))

      await xattr.set(filePath, 'com.linusu.test', 'Hello, World!')

      const attributes = await xattr.list(filePath)

      await Promise.all(
        attributes.map(async attributeName => {
          const attribute = await xattr.get(filePath, attributeName)
          return (info.attributes[attributeName] = await attribute.toString())
        })
      )

      response.on('readable', async () => {
        let len = response.headers['content-length']

        if (!len) {
          throw new Error('Unable to determine file size')
        }
        len = +len
        if (len !== len) {
          throw new Error('Invalid Content-Length received')
        }

        info.contentType = response.headers['content-type']
        info.contentLength = len
        const chunk = await response.read(fileType.minimumBytes)
        // response.destroy()
        const type = await fileType(chunk)
        info.format = type

        resolve(info)
      })
    })

    request.on('error', er => {
      reject(er)
    })
  })
}

module.exports = { getFileInfo }
