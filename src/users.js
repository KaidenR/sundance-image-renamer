const fs = require('fs')
const { app, dialog } = require('electron')
const parse = require('csv-parse/lib/sync')

async function getUserRecords() {
  const filePath = getFilePath()
  console.log('Reading file:', filePath)
  if (!filePath)
    return []

  const records = getRecordsFromFile(filePath)
  const recordsWithNamesAndImages = records.filter(r => r['First Name'] && r['Last Name'] && r['Picture'])

  if (recordsWithNamesAndImages.length)
    return recordsWithNamesAndImages

  dialog.showMessageBox({
    type: 'warning',
    message: `That file has no user records.\nMake sure it's a ".csv" file with "First Name", "Last Name", and "Picture" columns.`
  })
  return getUserRecords()
}

function getFilePath() {
  app.focus()
  const paths = dialog.showOpenDialog({
    title: 'Select users .csv file',
    properties: ['openFile']
  })
  return paths && paths[0]
}

function getRecordsFromFile(filePath) {
  const fileContents = fs.readFileSync(filePath)
  return parse(fileContents, {columns: true})
}


module.exports = {
  getUserRecords
}
