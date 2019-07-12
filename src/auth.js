const axios = require('axios')
const { BrowserWindow, session } = require('electron')

async function getCookie() {
  let window = new BrowserWindow({ width: 800, height: 750 })
  await window.loadURL('https://www.shiftboard.com/log-in/')

  await waitForLogin(window)

  const [cookie] = await session.defaultSession.cookies.get({ name: 'SB2Session' })
  window.close()
  return cookie && `${cookie.name}=${cookie.value};`
}

function waitForLogin(window) {
  return new Promise((resolve) => {
    window.webContents.on('did-navigate', (event, url) => {
      console.log(`navigated to ${url}`)
      if (!url.includes('auth') && !url.includes('log-in')) {
        resolve()
      }
    })

    window.on('close', resolve)
  })
}

async function verifyCanDownloadImages(records, cookie) {
  const url = records[0]['Picture']
  const response = await axios.get(url, { headers: { cookie }})

  if (response.headers['content-type'].includes('html'))
    throw new Error('Not logged in!')
}

module.exports = {
  getCookie,
  verifyCanDownloadImages
}
