const fs = require('fs')
const { app, BrowserWindow } = require('electron')
const path = require('path')
const download = require('image-downloader')
const PromisePool = require('es6-promise-pool')

const MAX_CONCURRENT_DOWNLOADS = 1

async function downloadImages(records, cookie) {
  const window = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: { nodeIntegration: true }
  })
  await window.loadURL(`file://${__dirname}/index.html`)
  let canceled = false
  window.on('close', () => canceled = true)

  let i = 0
  const pool = new PromisePool(() => {
    if (canceled)
      return null
    return downloadImage(i++, records, cookie, window)
  }, MAX_CONCURRENT_DOWNLOADS)

  await pool.start()
}

async function downloadImage(index, records, cookie, window) {
  const total = records.length
  if (index >= total)
    return null

  return saveImageForRecord(records[index], cookie)
    .then((imagePath) => {
      if (window.isDestroyed())
        return

      const percent = Math.round((index + 1) / total * 100)
      const message = `Downloaded ${index + 1} of ${total} images (${percent}%)`
      window.webContents.send('image-downloaded', message, imagePath)
    })
}

async function saveImageForRecord(record, cookie) {
  const imageUrl = record['Picture']
  const firstName = record['First Name']
  const lastName = record['Last Name']
  const fileName = `${firstName}${lastName}.jpg`
  const folderPath = path.join(app.getPath('downloads'), 'volunteer-images')

  if (!fs.existsSync(folderPath))
    fs.mkdirSync(folderPath)

  const filePath = path.join(folderPath, fileName)
  if (fs.existsSync(filePath))
    fs.unlinkSync(filePath)

  console.log('Writing file:', filePath)
  await download.image({ url: imageUrl, dest: filePath, headers: { cookie } })
  return filePath
}

module.exports = {
  downloadImages
}
