import { App, Menu } from "electron";

export function buildMenu(app:App) {
    
    const template: Electron.MenuItemConstructorOptions[] = [
        {
        label: app.name, // This will automatically use "Autoprogresslog" as the name
        submenu: [
            { role: 'about' }, // About menu item
            { type: 'separator' },
            {
                label: 'Settings',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                  
                },
            },
            { type: 'separator' },
            { role: 'services' }, // Mac-specific Services menu
            { type: 'separator' },
            { role: 'hide' }, // Hide menu item
            { role: 'unhide' }, // Unhide menu item
            { type: 'separator' },
            { role: 'quit' }, // Quit menu item
        ],
        },
        {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
        ],
        },
        {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
        },
        {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            { role: 'close' },
            { type: 'separator' },
            { role: 'front' },
        ],
        },
        {
        label: 'Help',
        submenu: [
            {
            label: 'Learn More',
            click: async () => {
                const { shell } = require('electron');
                await shell.openExternal('https://electronjs.org');
            },
            },
        ],
        },
    ];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}