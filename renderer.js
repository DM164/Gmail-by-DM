const electron = require('electron');
const { ipcRenderer, shell } = electron;
const path = require('path');

let platform = ''
let version = ''

// Get process info
ipcRenderer.invoke('app-platform').then((arg) => {
    platform = arg
    ipcRenderer.invoke('app-version').then((arg) => {
        version = arg
        console.log('Installed app version: ' + version)
        console.log('Platform: ' + platform)
        localStorage.setItem('platform', platform)
        checkForUpdates()
    })
})

const webview = document.getElementById('inbox');

// Change Useragent to Chrome in order to avoid the app being blocked by Google
webview.setUserAgent('Mozilla/5.0 (X11; Linux i686; rv:82.0) Gecko/20100101 Firefox/82.0')

// Inject custom CSS
webview.addEventListener('dom-ready', function () {
    // webview.insertRule('')
})

// Set zoom level
ipcRenderer.on('zoomin', () => {
    document.getElementById('inbox').setZoomFactor(1)
})
ipcRenderer.on('zoomout', () => {
    document.getElementById('inbox').setZoomFactor(0.9)
})