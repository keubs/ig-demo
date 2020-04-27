const router = require('express').Router();
const config = require('../config/constants');
const url = require('url');
const axios = require('axios')
const FormData = require('form-data');
const querystring = require('querystring');
const curl = new (require( 'curl-request' ))();

const CLIENT_ID = '550487078925958';
const CLIENT_SECRET = 'df535ebeffa7d35d37e693e78c731a06'
const REDIRECT_URI = 'https://keubs.webfactional.com/';
const OAUTH_URL = "https://api.instagram.com/oauth/access_token";
const API_URL = "https://graph.instagram.com/";

router.get('/', function(req, res) {
  res.render('index', getIndex(req));
});

router.get('/exchange', async function(req, res) {
  res.render('exchange', await exchangeTokenForCode(req));
})

function getIndex(req) {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  return {
    title: config.site.name,
    user: req.user,
    CLIENT_ID,
    REDIRECT_URI,
    qs: parsedQs['code']
  }
}

async function exchangeTokenForCode(req) {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let code = parsedQs['code'];
  const request = await makeRequest(code);

  console.log(request);
  return {
    access_token: request.access_token,
    user_id: request.user_id
  }
}

async function makeRequest(code) {

  data = curl
    .setBody({
      "client_id": CLIENT_ID,
      "client_secret": CLIENT_SECRET,
      "grant_type": 'authorization_code',
      "redirect_uri": 'https://keubs.webfactional.com/',
      "code": code,
    })
    .post(OAUTH_URL)
    .then(({statusCode, body, headers}) => {
        return body;
    })
    .catch((e) => {
        console.log(e);
    });
  // const fd = new FormData();
  // const data = await axios({
  //   method: "POST",
  //   url: "https://postman-echo.com/post", 
  //   data: fd,
  //   headers: fd.getHeaders(),
  // }).then((response) => {
  //   return response
  // }).catch((error) => {
  //   return error;
  // })

  return data;
}


module.exports = router;
