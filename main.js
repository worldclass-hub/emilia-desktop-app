const { app, BrowserWindow } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');

let djangoProcess = null;
let mainWindow = null;

function startDjango() {
    console.log('Starting Django...');
    console.log('Platform:', process.platform);
    
    const isWindows = process.platform === 'win32';
    const djangoPath = path.join(__dirname, 'django_app', 'manage.py');
    
    if (isWindows) {
        // Windows: Use python directly
        console.log('Windows mode - using python');
        djangoProcess = spawn('python', [djangoPath, 'runserver', '--noreload', '127.0.0.1:8000'], {
            cwd: path.join(__dirname, 'django_app'),
            env: { ...process.env, DJANGO_SETTINGS_MODULE: 'emilia_report.settings' },
            shell: true
        });
    } else {
        // Mac: Use shell script
        console.log('Mac mode - using shell script');
        djangoProcess = exec(path.join(__dirname, 'start_django.sh'));
    }
    
    if (djangoProcess) {
        djangoProcess.stdout.on('data', (data) => {
            console.log(`Django: ${data}`);
        });
        
        djangoProcess.stderr.on('data', (data) => {
            console.log(`Django stderr: ${data}`);
        });
        
        djangoProcess.on('error', (err) => {
            console.error('Failed to start Django:', err);
        });
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        title: "Emilia Report Card Maker",
        show: true,
        backgroundColor: '#f5f5f5'
    });
    
    // Show loading screen
    mainWindow.loadURL(`data:text/html,
        <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;margin:0;">
                <div style="text-align:center;">
                    <h2>Emilia Report Card Maker</h2>
                    <p>Loading... Please wait</p>
                    <p style="font-size:12px;color:#888;">Starting server...</p>
                </div>
            </body>
        </html>
    `);
    
    // Wait 8 seconds then load the app
    setTimeout(() => {
        console.log('Loading app in window...');
        mainWindow.loadURL('http://127.0.0.1:8000').catch(err => {
            console.error('Failed to load:', err);
            mainWindow.loadURL('data:text/html,<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;"><h2>Error</h2><p>Could not start server. Please restart the app.</p></body></html>');
        });
    }, 8000);
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startDjango();
    createWindow();
});

app.on('window-all-closed', () => {
    if (djangoProcess) {
        djangoProcess.kill();
    }
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});