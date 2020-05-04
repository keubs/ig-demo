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
const API_URL = "https://graph.instagram.com";

router.get('/', function(req, res) {
  res.render('index', getIndex(req));
});

router.get('/exchange', async function(req, res) {
  res.render('exchange', await exchangeTokenForCode(req));
});

router.get('/long-lived', async function(req, res) {
  res.render('longlived', await exchangeShortTokenForLong(req));
})

router.get('/media', async function(req, res) {
  res.render('media', await getMediaForUser(req));
});

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
  let request = await makeRequestForToken(code);
  let response = JSON.parse(request.body);
  let output = (request.status === 200) ?
  {
    access_token: response.access_token,
    user_id: response.user_id
  }
  : {
    error: response.error_message,
  };
  return output;
}

async function exchangeShortTokenForLong(req) {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let code = parsedQs['token'];
  let request = await getLongLivedToken(code);
  t = new Date();
  t.setSeconds(t.getSeconds() + request.body.expires_in);
  let output = (request.status === 200) ?
  {
    access_token: request.body.access_token,
    expiration: t.toDateString(),
  }
  : {
    error: response.error,
  };
  return output;
}

async function getMediaForUser(req) {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let token = parsedQs['token'];
  let request;
  if(token) request = await getMedia(token);
  console.log(request.data.data);
  return {
    data: request.data.data,
  };
}

async function makeRequestForToken(code) {

  data = curl
    .setBody({
      "client_id": CLIENT_ID,
      "client_secret": CLIENT_SECRET,
      "grant_type": 'authorization_code',
      "redirect_uri": REDIRECT_URI,
      "code": code,
    })
    .post(OAUTH_URL)
    .then(({statusCode, body}) => {
        return {
          body: body,
          status: statusCode,
        };
    })
    .catch((e) => {
        console.log(e);
    });

  return data;
}

async function getLongLivedToken(token) {
  const resp = await axios.get(
    `${API_URL}/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${token}`
  ).then((response) => {
    return {
      status: response.status,
      body: response.data
    };
  }).catch((error) => {
    return error;
  });

  return resp;
}


async function getMedia(token) {
  const fields = 'id,media_type,media_url,username,timestamp';
  
  const resp = await axios.get(
    `${API_URL}/me/media?fields=${fields}&access_token=${token}`
  ).then((response) => {
    return response;
  }).catch((error) => {
    return error;
  });

  return resp;
}

module.exports = router;
