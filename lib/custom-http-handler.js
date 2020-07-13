var uniqid = require('uniqid');

var state = {};

/**
 * @param {Request} req
 * @param {Response} res
 *
 * @return {true|false}
 * */
function customHttpHandler(req, res) {
  var parsedUrl = getParsedUrl(req);

  if (parsedUrl[0] !== 'track') {
    return false;
  }

  methodHandler(req, res);

  return true;
}

/**
 * @param {Request} req
 * @param {Response} res
 * */
function methodHandler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  switch (req.method) {
    case 'GET':
      getTrack(req, res);
      break;

    case 'POST':
      createTrack(req, res);
      break;

    case 'DELETE':
      deleteTrack(req, res);
      break;
  }
}

/**
 * HTTP request handlers
 * */

/**
 * @param {Request} req
 * @param {Response} res
 * */
function getTrack(req, res) {
  var parsedUrl = getParsedUrl(req);
  var trackId = parsedUrl[1];
  var stateTrack = state[trackId];

  if (stateTrack) {
    console.log('Get by user:', trackId);
    res.statusCode = 200;
    res.end(JSON.stringify(stateTrack));
  } else {
    console.log('Get by user error:', trackId);
    res.statusCode = 404;
    res.end(JSON.stringify({
      errorCode: 404,
      errorMessage: 'Track with following ID is Not Found: ' + trackId,
    }));
  }
}

/**
 * @param {Request} req
 * @param {Response} res
 * */
function createTrack(req, res) {
  parseBody(req, function (track) {
    var errors = validateTrack(track);

    if (errors) {
      console.log('Created by user error:', errors);
      res.statusCode = 404;
      return res.end(JSON.stringify({
        errorCode: 404,
        errorMessage: 'It\'s invalid track object',
        errors: errors,
      }));
    }

    var trackId = uniqid();
    state[trackId] = track;
    scheduleDeleteTrack(trackId);
    console.log('Created by user', trackId);

    res.statusCode = 201;
    return res.end(JSON.stringify({
      trackId: trackId,
    }));
  });
}

/**
 * @param {Request} req
 * @param {Response} res
 * */
function deleteTrack(req, res) {
  var parsedUrl = getParsedUrl(req);
  var trackId = parsedUrl[1];
  var stateTrack = state[trackId];

  if (stateTrack) {
    console.log('Deleted by user', trackId);
    delete state[trackId];
    res.statusCode = 200;
    res.end(JSON.stringify({
      trackId: trackId,
    }));
  } else {
    console.log('Deleted by user error:', trackId);
    res.statusCode = 404;
    res.end(JSON.stringify({
      errorCode: 404,
      errorMessage: 'Track with following ID is Not Found: ' + trackId,
    }));
  }
}

/**
 * Utils
 * */

/**
 * @param {Request} req
 * @return {string[]}
 * */
function getParsedUrl(req) {
  /**
   * @example ['track', '1234567890']
   * @example ['track']
   * @example ['anotherUrl']
   * */
  return req.url.split('/').filter(function (item) { return !!item });
}

function parseBody(req, callback) {
  var body = [];
  req
    .on('data', function (chunk) { return body.push(chunk); })
    .on('end', function () {
      try {
        return callback(JSON.parse(Buffer.concat(body).toString()));
      } catch (e) {
        return callback({});
      }
    });
}

// TODO add this
function validateTrack() {
  return false;
}

function scheduleDeleteTrack(uniqueId) {
  var ONE_DAY = 1000 * 60 * 60 * 24;
  setTimeout(function () {
    if (state[uniqueId]) {
      console.log('Deleted by timeout', uniqueId);
      delete state[uniqueId];
    }
  }, ONE_DAY);
}

exports.customHttpHandler = customHttpHandler;
