//Modules
const {app, BrowserWindow, dialog} = require('electron')

let mainWindow
let rutaProyecto

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    minWidth: 500,
    minHeight: 400,
    show: false,
    webPreferences: {nodeIntegration: true}
  });


  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

}


app.on('ready', () => {
  rutaProyecto = app.getAppPath()
  console.log('appPath: ' + rutaProyecto)
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if(mainWindow === null) createWIndow()
})
