const { app } = require('electron')

const auth = require('./auth')
const { getUserRecords } = require('./users')
const { downloadImages } = require('./images')

module.exports = function() {
  doTheThing()
    .then(() => {
      console.log('Finished!')
      app.exit()
    })
    .catch((err) => {
      console.error(err)
      app.exit()
    })
}

async function doTheThing() {
  const records = await getUserRecords()
  if (!records.length)
    return app.exit()

  const cookie = await auth.getCookie()
  if (!cookie)
    return app.exit()

  await auth.verifyCanDownloadImages(records, cookie)

  await downloadImages(records, cookie)
}




