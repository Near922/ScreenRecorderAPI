const child_process = require('child_process');
const shelljs = require('shelljs');
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
    const command = `ffmpeg  -y -rtbufsize 100M -f gdigrab -framerate 30 -probesize 10M -draw_mouse 1 -i desktop -c:v libx264 -r 30 -preset ultrafast -tune zerolatency -crf 25 -pix_fmt yuv420p -f mp4 c:/drivers/${file_name}`

   child = child_process.exec(command)
    res.send("Recording started")
    }
    catch (ex)
    {
        console.log(ex.message);
        res.status(500).send("There was an error starting the recording");
    }
})

app.post('/stop', (req, res) => {

if (child != null)
{
    child.stdin.write("q" + "\n")
    child.on('close', (code) => {
 
        try{
        console.log("converting file")
        const file_name = req.body.file_name;
        var f = `c:/drivers/${file_name}`
        const command = `convert.bat ${f} ${f.replace(".mp4", "").trim()}`
        shelljs.exec(command);
        res.send("stopped recording. file is ready")
   

        }
        catch (ex)
        {
            console.log(ex.message);
            res.status(500).send("There was an error saving the recording");
        }
    });
}

});

app.listen(port, () => {
  console.log(`Romeo Selenium Grid Recorder listening at http://localhost:${port}`)
})