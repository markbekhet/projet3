const { app, BrowserWindow } = require('electron');

function createWindow () {
    const window = new BrowserWindow({
      width: 800,
      height: 600
    })
  
    window.loadFile(`${__dirname}/dist/index.html`)
    //window.loadFile('C:/Users/batik/Documents/GitHub/log3900-101/angular-client/dist/angular-client/index.html');
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
