let cachedVersion = ''
function checkForUpdates() {
    const Http = new XMLHttpRequest();
    let platform = remote.process.platform
    if (platform === 'linux'){ platform = 'debian' }
    const url = `https://update-server-gmail-by-dm.grandpamining.vercel.app/update/${platform}/1.0.0/`;
    Http.open("GET", url);
    Http.send();

    Http.onloadend = (e) => {
        let response = JSON.parse(Http.responseText)
        cachedVersion = response.name
        if (response.name.length > 7) {
            cachedVersion = cachedVersion.slice(0, cachedVersion.length - 5)
        }
        if (cachedVersion > remote.app.getVersion()) {
            console.log('Update required!')
            ipcRenderer.send('download-update')
        } else {
            console.log('No update required')
        }
    }
}
function installUpdate() {
    const child = require('child_process').execFile;
    let executablePath = null

    if (remote.process.platform === 'win32'){
        executablePath = path.join(__dirname, `../updates/files/gmail_by_dm-${cachedVersion}-setup.exe`)
    } else if (remote.process.platform === 'linux'){
        executablePath = path.join(__dirname, `../updates/files/gmail-by-dm_${cachedVersion}_amd64.deb`)
    }

    child(executablePath, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data.toString());
    });
}
ipcRenderer.on('download-successfull', () => {
    setTimeout(() => {
        installUpdate()
    }, 4000);
})

setTimeout(() => {
    checkForUpdates()
}, 60000);