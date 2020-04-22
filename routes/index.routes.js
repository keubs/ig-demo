const router = require('express').Router();
const config = require('../config/constants');
const url = require('url');
const querystring = require('querystring');

const app_id = 550487078925958;
const redirect_uri = 'https://keubs.webfactional.com/';


router.get('/', function(req, res) {
  res.render('index', booya(req));
});

function booya(req) {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  console.log(parsedQs);
  return {
    title: config.site.name,
    user: req.user,
    app_id,
    redirect_uri,
    qs: parsedQs['code']
  }
}
module.exports = router;
