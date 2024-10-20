const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8888;
require('dotenv').config();

app.use(express.static('static'));
app.use(cors());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

const options = {
  cert: fs.readFileSync('./sslcert/fullchain.pem'),
  key: fs.readFileSync('./sslcert/privkey.pem')
};

https.createServer(options, app).listen(8443);

app.get('/latest', (req, res) => {
    const directoryPath = process.env.DIRECTORY_PATH;
    console.log(directoryPath);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {

            return res.status(500).send('Unable to scan directory: ' + err);
        }

        let latestFile = { name: null, time: 0 };

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile() && stats.mtimeMs > latestFile.time) {
                latestFile = { name: file, time: stats.mtimeMs };
            }
        });

        if (latestFile.name) {
            const latestFilePath = path.join(directoryPath, latestFile.name);
            res.set('Content-Disposition', `attachment; filename="${latestFile.name}"`);
            res.sendFile(latestFilePath);
        } else {
            res.status(404).send('No files found');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});