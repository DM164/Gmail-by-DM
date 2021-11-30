// detect platform and load correct file
if (localStorage.getItem('platform') != undefined) {
    console.log(localStorage.getItem('platform'));
} else {
    ipcRenderer.invoke('app-platform').then((arg) => {
        console.log('Platform: ' + arg)
        localStorage.setItem('platform', arg)
    })
}

function loadTopBar(arg) {
    let topBar = document.createElement('link')
    topBar.rel = "stylesheet"
    topBar.href = `./titlebar/${arg}.css`
    // topBar.href = `./topbar/darwin.css`
    document.getElementsByTagName('head')[0].prepend(topBar)
    document.getElementsByClassName('topBar')[0].style.opacity = "1"
    if (arg !== 'darwin') { 
        document.getElementById('window-buttons').style.opacity = "1"
    }
}
loadTopBar(localStorage.getItem('platform'))

// button functionality
document.getElementById("closeApp").addEventListener("click", function (e) {
    ipcRenderer.send('handle-window-buttons', 'close')
});

document.getElementById("minimizeApp").addEventListener("click", function (e) {
    ipcRenderer.send('handle-window-buttons', 'minimize')
});

document.getElementById("maximizeApp").addEventListener("click", function (e) {
    ipcRenderer.invoke('getWindowStatus').then((arg) => {
        if (!arg) {
            ipcRenderer.send('handle-window-buttons', 'maximize')
        } else {
            ipcRenderer.send('handle-window-buttons', 'unmaximize')
        }
    })
});