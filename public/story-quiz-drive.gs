var FOLDER_NAME = 'Story Quiz';
var PASSWORD = 'change-me';

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json({ ok: true, message: 'Story Quiz script is ready.' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.password !== PASSWORD) {
      return json({ ok: false, error: 'Teacher password was rejected.' });
    }
    if (data.ping) return json({ ok: true, ping: true });
    if (!data.pdfBase64 || !data.filename) {
      return json({ ok: false, error: 'Missing quiz sheet.' });
    }
    var folder = getFolder_();
    var name = String(data.filename).replace(/[\\/]/g, '').slice(0, 180);
    var oldFiles = folder.getFilesByName(name);
    while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);
    var blob = Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64),
      'application/pdf',
      name
    );
    var file = folder.createFile(blob);
    return json({ ok: true, id: file.getId(), name: file.getName() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getFolder_() {
  var matches = DriveApp.getFoldersByName(FOLDER_NAME);
  return matches.hasNext() ? matches.next() : DriveApp.createFolder(FOLDER_NAME);
}
