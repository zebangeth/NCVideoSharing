import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
// 告诉 Express 应用使用一个中间件，该中间件的作用是解析请求体中的 JSON 数据。当客户端发送包含 JSON 数据的请求时，
// 这个中间件会解析数据，并将其添加到 req.body 对象中，使得后续的中间件或路由处理程序可以访问这些数据。
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.post('/process-video', (req, res) => {

  // Get the path of the input video file from the request body
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;
  
  // Check if the input file path or the output file path are defined
  if (!inputFilePath && !outputFilePath) {
    return res.status(400).send('Bad Request: Missing both input and output file paths');
  } else if (!inputFilePath) {
    return res.status(400).send('Bad Request: Missing input file path');
  } else if (!outputFilePath) {
    return res.status(400).send('Bad Request: Missing output file path');
  }

  // Create the ffmpeg command
  ffmpeg(inputFilePath).outputOptions('-vf', 'scale=-1:360') // convert the video into 360p
    .on('end', function() {
        console.log('Processing finished successfully');
        res.status(200).send('Processing finished successfully');
    })
    .on('error', function(err: any) {
        console.log('An error occurred: ' + err.message);
        res.status(500).send('An error occurred: ' + err.message);
    })
    .save(outputFilePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
