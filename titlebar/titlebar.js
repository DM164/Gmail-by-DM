const { remote } = require('electron');

// Topbar
document.getElementById("closeApp").addEventListener("click", function (e){
    const window = remote.getCurrentWindow();
    window.close();
});

document.getElementById("minimizeApp").addEventListener("click", function (e) {
    const window = remote.getCurrentWindow();
    window.minimize(); 
});

document.getElementById("maximizeApp").addEventListener("click", function (e) {
    const window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();          
    } else {
        window.unmaximize();
    }
});