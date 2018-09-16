import { app, BrowserWindow, ipcMain } from 'electron'
const path = require('path')
const shelljs = require('shelljs')

const Promise = require('bluebird')
var fs = Promise.promisifyAll(require("fs"));
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
ipcMain.on('concat', async (ev, firstFiles, secondFiles)=>{
  if(!firstFiles || firstFiles.length === 0 || firstFiles.length !== secondFiles.length){
    ev.sender.send('progress', 100)
    return
  }
  
  shelljs.mkdir('-p', path.dirname(firstFiles[0]) + '/output')
  let includeFile = path.resolve(app.getPath('temp') + '/files.txt')
  let ffmpeg = path.resolve(__dirname + '/../bin/ffmpeg.exe').split(path.sep).join('/')
  if(process.env.NODE_ENV !== "development"){
    ffmpeg = path.resolve(path.dirname(process.execPath) + '/src/bin/ffmpeg.exe')
  }
  for(let i=0;i<firstFiles.length;i++){
    let first = firstFiles[i].split(path.sep).join('\\\\')
    let second = secondFiles[i].split(path.sep).join('\\\\')
    let str = 'file ' + first + '\r\n' + 'file ' + second 
    await fs.writeFileAsync(includeFile, str)
    const { stdout, stderr } = await execFile(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i' , includeFile , '-c', 'copy', (path.dirname(firstFiles[0]) + '\\output\\' + path.basename(secondFiles[i])).split(path.sep).join('/')])
    console.log(stdout, stderr)
    ev.sender.send('progress', Math.floor((i+1) / firstFiles.length * 100))
  }
})
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
