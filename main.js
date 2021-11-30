const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { download } = require('electron-dl');
const { webContents } = require('electron');

const { app, BrowserWindow, Menu, ipcMain, shell } = electron;

// Installation of the app

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        } catch (error) { }

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};

//prevent windows from being garbage collected
let mainWindow

// called when app is ready
app.on("ready", function () {
    createInstance()
    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.show()
    })
});

//mainWindow creation (app)
function createInstance() {
    //create new window
    mainWindow = new BrowserWindow({
        frame: false,
        icon: path.join(__dirname, 'assets/icons/png/icon.png'),
        width: 1000,
        backgroundColor: '#fff',
        'minHeight': 500,
        'minWidth': 780,
        show: false,
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true, //remove in future Electron version
            contextIsolation: false,
            webviewTag: true
        },
        show: false,
        titleBarStyle: 'hidden'
    });
    // Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }), { userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:82.0) Gecko/20100101 Firefox/82.0' });

    //Quit app when closed
    mainWindow.on("closed", function () {
        app.quit();
    })
}

ipcMain.on('app:relaunch', () => {
    app.relaunch()
    app.quit()
})


let filepath = path.join(__dirname, '../updates/files')
console.log(filepath)
//download update in the background
ipcMain.on('download-update', (arg) => {

    if (fs.existsSync(filepath)) {
        fs.readdir(filepath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(filepath, file), err => {
                    if (err) throw err;
                });
            }
        });
    }
    createDownloadDialog()
})

ipcMain.on('download-started', async (event, { url }) => {
    const win = BrowserWindow.getFocusedWindow();
    console.log(await download(win, url, { directory: filepath, overwrite: true }));
    downloadWindow.webContents.send('download-successfull')
    mainWindow.webContents.send('download-successfull')
})

function createDownloadDialog() {
    //create new window
    downloadWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true, enableRemoteModule: true },
        width: 400,
        height: 160,
        frame: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, 'assets/icons/png/icon.png'),//change later
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false
    });
    // Load HTML into window
    downloadWindow.loadURL(url.format({
        pathname: path.join(__dirname, './updates/download.html'),
        protocol: 'file:',
        slashes: true
    }));
    downloadWindow.webContents.on('dom-ready', () => {
        downloadWindow.show()
    })
    downloadWindow.on("closed", function () {
        downloadWindow = null
    })
}

// handle remote in electron 14
ipcMain.handle('app-version', async (e) => {
    return app.getVersion()
})
ipcMain.handle('app-platform', async (e) => {
    return process.platform
})
ipcMain.on('browser', (e, arg) => {
    shell.openExternal(arg);
})
ipcMain.handle('getWindowStatus', async (e) => {
    return mainWindow.isMaximized()
})

ipcMain.on('handle-window-buttons', (e, arg) => {
    switch (arg) {
        case 'close':
            mainWindow.close()
            break;
        case 'minimize':
            mainWindow.minimize()
            break
        case 'maximize':
            mainWindow.maximize()
            break
        case 'unmaximize':
            mainWindow.unmaximize()
            break
        default:
            break;
    }
})
ipcMain.on('cancelUpdate', () => {
    downloadWindow.close()
})