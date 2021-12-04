const { app, BrowserWindow } = require('electron');

function createWindow () {
  const window = new BrowserWindow({
    width: 1920,
    height: 1000
  });

  window.loadFile(`${__dirname}/dist/index.html`);
}

app.whenReady().then(() => {
  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})
