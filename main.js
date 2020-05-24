//Modules
const {app, BrowserWindow, session, ipcMain, dialog} = require('electron')
const fs = require('fs')
const path = require('path')

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


  mainWindow.loadFile('index.html')

  mainWindow.webContents.openDevTools()
  let ses = mainWindow.webContents.session
  console.log(ses.getUserAgent())



  mainWindow.on('closed', () => {
    //ses.clearStorageData()
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

}

/*IPC functions*/
ipcMain.on('oi-reportes-grupos-req', (e,args) => {
  var contenido = fs.readFileSync(args, 'utf8');
  e.sender.send('oi-reportes-grupos-res', contenido);
})
ipcMain.on('oi-puntos-puntos-req', (e,args) => {
  var contenido = fs.readFileSync(args, 'utf8');
  e.sender.send('oi-puntos-puntos-res', contenido);
})
ipcMain.on('oi-puntos-canales-req', (e,args) => {
  var contenido = fs.readFileSync(args, 'utf8');
  e.sender.send('oi-puntos-canales-res', contenido);
})
ipcMain.on('OI-grupos-req', (e, args) => {
  var contenido = fs.readFileSync(args, 'utf8');
  e.sender.send('OI-grupos-res', contenido);
})
ipcMain.on('guardar-punto-req', (e, args) => {
  fs.writeFileSync(args[0], JSON.stringify(args[1]), 'utf8');
  e.sender.send('guardar-punto-res', {ok: 'Archivo Guardado'});
})
ipcMain.on('guardar-grupo-req', (e, args) => {
  fs.writeFileSync(args[0], JSON.stringify(args[1]), 'utf8');
  e.sender.send('guardar-grupo-res', {ok: 'Archivo Guardado'});
});
ipcMain.on('guardar-canal', (e, args) => {
  fs.writeFileSync(args[0],JSON.stringify(args[1]), 'utf8');
  e.sender.send('guardar-canal-response', {ok: 'respuesta Correcta'});
})

ipcMain.on('obtenerInfo-request', (e,args) => {
  var contenido = fs.readFileSync(args, 'utf8');
  e.sender.send('obtenerInfo-response', contenido);
})

ipcMain.on('channelAudio', (e,args) => {
  dialog.showOpenDialog(mainWindow, {
    defaultPath: app.getPath('desktop'),
    properties: ['openFile'],
    filters: [
    { name: 'Audio Files', extensions: ['mp3'] }
  ]
  }).then(result => {
    if(result.canceled){
      e.sender.send('channelAudio-res', {ok:''});
    }else{
      console.log(result.filePaths[0]);
      let nombre = result.filePaths[0].split(path.sep);
      let nuevaRuta = args
      //produccion
      //nuevaRuta += path.sep +
      nuevaRuta += path.sep + 'public' + path.sep + 'Audios' + path.sep + nombre[nombre.length-1];
      console.log(nuevaRuta);

      //transferir el archivo
      fs.copyFileSync(result.filePaths[0], nuevaRuta);
    }
  })
})

ipcMain.on('channel1', (e,args) => {
  dialog.showOpenDialog(mainWindow, {
    defaultPath: app.getPath('desktop'),
    properties: ['openDirectory']
  }).then(result => {
    if(result.canceled) e.sender.send('channel1-response', {ok:''})
    else e.sender.send('channel1-response', {ok:result.filePaths[0]})
    console.log(result.filePaths)

  }).catch(err => {
    console.log(err);
    e.sender.send('channel1-response', {err:err})
  })
})

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
