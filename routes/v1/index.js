const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const routeDirectory = path.join(__dirname);

fs.readdirSync(routeDirectory).forEach((file) => {
  const routeFilePath = path.join(routeDirectory, file);
  const routeFileName = path.parse(file).name;

  if (routeFileName !== 'index') {
    router.use(`/${routeFileName}`, require(routeFilePath));
  }
});

module.exports = router;
