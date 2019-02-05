require('dotenv').config();
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const path = require('path');
const fs = require('fs');
const https = require('https');
const certOptions = {
    key: fs.readFileSync(path.resolve('cert/server.key')),
    cert: fs.readFileSync(path.resolve('cert/server.crt'))
  }
const server = https.createServer(certOptions);

const { app, BrowserWindow } = require('electron');
const io = require('socket.io')(server);
const apiai = require('apiai')(APIAI_TOKEN);





function createWindow () {


    io.on('connection', function(socket) {

        socket.on('chat message', function(text) {
            let apiaiReq = apiai.textRequest(text, {
                sessionId: APIAI_SESSION_ID
              });

              apiaiReq.on('response', (response) => {
                let aiText = response.result.fulfillment.speech;
                console.log('Bot reply: ' + aiText);
                socket.emit('bot reply', aiText); // Send the result back to the browser!
              });
          
              apiaiReq.on('error', (error) => {
                console.log(error);
              });
          
              apiaiReq.end();
        });

        
        socket.on('disconnect', function () {
            console.log('socket disconnect...', socket.id);
            // handleDisconnect();
          });
        
        socket.on('error', function (err) {
            console.log('received error from socket:', socket.id);
            console.log(err);
          });
    });


    server.listen(3000, function(err) {
        if (err) throw err;
        console.log('listening on port 3000');
    });


    let win = new BrowserWindow({ width: 800, height: 600 });
    win.on('closed', () => {
        win = null;
      });
      win.loadURL(`file://${__dirname}/views/index.html`);
      win.webContents.openDevTools();
}




app.on('ready', createWindow);
