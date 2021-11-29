let cachedVersion = ''
let fullCachedVersion = ''

function checkForUpdates() {
    const Http = new XMLHttpRequest();
    if (platform === 'linux') {
        platform = 'debian'
    } else if (platform === 'darwin') {
        platform = 'dmg'
    }
    const url = `https://update-gmail-by-dm-3kis.vercel.app/update/${platform}/0.0.0/`;
    Http.open("GET", url);
    Http.send();

    Http.onloadend = (e) => {
        let response = JSON.parse(Http.responseText)
        cachedVersion = response.name
        fullCachedVersion = response.name

        if (cachedVersion > version) {
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

    if (platform === 'win32'){
        executablePath = path.join(__dirname, `../updates/files/gmail_by_dm-${cachedVersion}-setup.exe`)
    } else if (platform === 'dmg'){
        ipcRenderer.send('browser', 'https://update-gmail-by-dm-3kis.vercel.app/download')
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