import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { 
    uploadProcessedVideo,
    downloadRawVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    convertVideo,
    setupDirectories
  } from './storage';
  

// Create the local directories for videos
setupDirectories();

const app = express();
// 告诉 Express 应用使用一个中间件，该中间件的作用是解析请求体中的 JSON 数据。当客户端发送包含 JSON 数据的请求时，
// 这个中间件会解析数据，并将其添加到 req.body 对象中，使得后续的中间件或路由处理程序可以访问这些数据。
app.use(express.json());

// Process a video file from Cloud Storage into 360p
app.post('/process-video', async (req, res) => {

    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
      data = JSON.parse(message);
      if (!data.name) {
        throw new Error('Invalid message payload received.');
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send('Bad Request: missing filename.');
    }
  
    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
  
    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);
  
    // Process the video into 360p
    try { 
      await convertVideo(inputFileName, outputFileName)
    } catch (err) {
      await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
      ]);
      return res.status(500).send('Processing failed');
    }
    
    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);
  
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);
  
    return res.status(200).send('Processing finished successfully');
  });
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
  });
  