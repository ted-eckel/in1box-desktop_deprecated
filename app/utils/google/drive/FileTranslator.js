/** @flow */
function translateFile(rawFile) {
  return {
    service: 'drive',
    date: Date.parse(rawFile.modifiedTime),
    file: rawFile,
    id: rawFile.id
  }
}

export default translateFile
