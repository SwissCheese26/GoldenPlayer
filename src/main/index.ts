import { app, shell, BrowserWindow, protocol, net, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { scanLibrary } from './library'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'gp-media',
    privileges: { secure: true, supportFetchAPI: true, stream: true, corsEnabled: true }
  }
])

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 640,
    minHeight: 480,
    show: false,
    frame: false,
    backgroundColor: '#0a0014',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('gp-media', (request) => {
    const filePath = decodeURIComponent(request.url.replace('gp-media://local/', ''))
    return net.fetch(pathToFileURL(filePath).toString())
  })

  ipcMain.handle('library:selectFolders', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'multiSelections']
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('library:scan', (_event, folderPath: string) => scanLibrary(folderPath))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
