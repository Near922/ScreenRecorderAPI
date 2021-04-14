const child_process = require('child_process');
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
let child;
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/start', (req, res) => {

    try {
        const file_name = req.body.file_name;
        child = child_process.exec(`start /min node C:\\drivers\\ScreenRecorderApi\\ScreenRecorderAPI\\record.js pre_${file_name}`)
        res.send("Recording started")
    }
    catch (ex) {
        console.log(ex.message);
        res.status(500).send("There was an error starting the recording");
    }
})

app.post('/startGridNode', (req, res) => {

    try {
        const hub_ip_address = req.body.hub_ip_address;
        child_process.exec(`start /min java -jar selenium-server-standalone-3.141.59.jar -role node -hub ${hub_ip_address} -port 5555 -nodeConfig \"nodeconfig.json.txt\"`,
            {
                cwd: 'c:\\drivers'
            })
        res.send("Grid node started")
    }
    catch (ex) {
        console.log(ex.message);
        res.status(500).send("There was an error starting the gride node");
    }
})


app.post('/upload', async (req, res) => {
    var AWS = require('aws-sdk');
    AWS.config.update({
        region: 'us-east-2'
    });
    try {

        const file_name = req.body.file_name;
        const file_path = `C:\\drivers\\${file_name}`;
        let repairFileProcess = child_process.exec(`start /min ffmpeg -i C:\\drivers\\pre_${file_name} -c copy ${file_path}`);

        repairFileProcess.on("exit", async () => {
            var fs = require('fs');
            const checkTime = 1000;

            const messageFile = file_path;
            const timerId = setInterval(async () => {
                const isExists = fs.existsSync(messageFile, 'utf8')
                if (isExists) {
                    let params = {
                        Bucket: "romeo-test-recordings",
                        Key: file_name,
                        Body: fs.createReadStream(file_path)
                    };
        
                    await new AWS.S3().putObject(params).promise().then(() => {
                    console.log('Success!!!')
                    }).catch((err) => { console.log(`Error: ${err}`) })
                    res.send("Uploaded file successfully")
                    clearInterval(timerId)
                }
            }, checkTime)

        });
    }
    catch (ex) {
        console.log(ex.message);
        res.status(500).send("There was an error uploading the file to s3");
    }
})

app.post('/stop', (req, res) => {

    if (child != null) {

        try {
            console.log('kill');


            child_process.exec(`taskkill /F /im ffmpeg.exe`);
            child.on('close', (code) => {

                res.send("stopped recording. file is ready")
            });
            child.on('exit', (code) => {

                res.send("stopped recording. file is ready")
            });
        } catch (ex) {
            console.log(ex.message);
            res.status(500).send("There was an error stopping the recording");
        }


    }
    else {
        res.send("There is no process running to stop")
    }
});

app.listen(port, () => {
    console.log(`Romeo Selenium Grid Recorder listening at http://localhost:${port}`)
})