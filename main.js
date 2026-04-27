const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let djangoProcess = null;
let mainWindow = null;

function startDjango() {
    console.log('Starting Django...');
    console.log('Platform:', process.platform);
    
    const isWindows = process.platform === 'win32';
    const djangoPath = path.join(__dirname, 'django_app', 'manage.py');
    
    if (isWindows) {
        // Windows: Use python directly with proper shell
        const pythonCmd = 'python';
        const djangoDir = path.join(__dirname, 'django_app');
        
        djangoProcess = spawn(pythonCmd, [djangoPath, 'runserver', '--noreload', '127.0.0.1:8000'], {
            cwd: djangoDir,
            env: { ...process.env, DJANGO_SETTINGS_MODULE: 'emilia_report.settings' },
            shell: true,
            detached: false
        });
    } else {
        // Mac: Use the virtual environment python
        const pythonPath = '/Users/mac/Desktop/Emilia_Exam_Report_Card_App_Working/venv/bin/python3';
        djangoProcess = spawn(pythonPath, [djangoPath, 'runserver', '--noreload', '127.0.0.1:8000'], {
            cwd: path.join(__dirname, 'django_app'),
            env: { ...process.env, DJANGO_SETTINGS_MODULE: 'emilia_report.settings' }
        });
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
    
    mainWindow.loadURL(`data:text/html,
        <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">
                <div style="text-align:center;">
                    <h2>Emilia Report Card Maker</h2>
                    <p>Loading... Please wait</p>
                    <p style="font-size:12px;color:#888;">Starting server...</p>
                </div>
            </body>
        </html>
    `);
    
    setTimeout(() => {
        console.log('Loading app...');
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
        console.log('Shutting down Django...');
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', djangoProcess.pid, '/f', '/t'], { shell: true });
        } else {
            process.kill(-djangoProcess.pid, 'SIGKILL');
        }
    }
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
