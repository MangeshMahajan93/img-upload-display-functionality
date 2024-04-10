const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const Jimp = require('jimp');

const imgApp = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

imgApp.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.render('index', { images });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

imgApp.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log(req.file);
    const image = await Jimp.read(req.file.path);
    if (req.body.filter === 'grayscale') {
      image.grayscale();
    } else if (req.body.filter === 'sepia') {
      image.sepia();
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    const filePathNew = filePath.replace(/^public\//, '');

    await image.write(filePath);

    const fileSize =  (req.file.size / 1024).toFixed(2);

    const newImage = new Image({
      filename: req.file.originalname,
      path: filePathNew,
      date: Date(),
      filter:req.body.filter,
      size:fileSize
    });
    await newImage.save();
    res.json({ message: 'Image uploaded successfully!' });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

imgApp.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json({ images });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

imgApp.use(express.static('uploads'));

module.exports = imgApp;
