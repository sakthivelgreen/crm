const express = require('express');
const axios = require('axios')
const cookie_parser = require('cookie-parser');

const app = express.Router();

// Define authorization code as a variable
let Access_Token;

module.exports = app;