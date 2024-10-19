const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
require('dotenv').config();

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/check-players', (req, res)=> {
    //make a post request to a specific url with this json
    let jsonOBJ = {
        "content": null,
        "embeds": [
          {
            "title": "Quelqu'un s'est connecté",
            "description": "Joueurs en ligne :",
            "color": 5814783
          }
        ],
        "attachments": []
      };

      console.log(jsonOBJ);
      console.log(JSON.stringify(jsonOBJ));
      console.log(process.env.WEBHOOK_URL);
      const axios = require('axios');
      axios.post(process.env.WEBHOOK_URL, jsonOBJ, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log(`statusCode: ${response.statusCode}`);
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
      res.send('Check players');
});

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