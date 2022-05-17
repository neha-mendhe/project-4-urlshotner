const express = require('express');
const router = express.Router();

const {createUrl} = require("../controllers/urlController")

//url api
router.post("/url/shorten", createUrl )


module.exports = router;