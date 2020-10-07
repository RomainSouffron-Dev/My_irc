const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log('server up')
});


module.exports = router;