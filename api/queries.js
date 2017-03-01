var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/healthfit'; // startrek is an example database name
var db = pgp(connectionString);


/////////////////////
// Query Functions
/////////////////////

function getUser(req, res, next) {
  var userid = parseInt(req.params.userid);
  db.any('SELECT GM.group_id, G.name FROM group_member GM, groups G WHERE GM.user_id = $1 AND G.id = GM.group_id', userid)
    .then(function (data) { 
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrived user data'
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function getGroupInfo(req, res, next) {
  var groupid = parseInt(req.params.groupid);
  db.any('SELECT G.name as group_name, GM.user_id, U.name FROM groups G, group_member GM, users U WHERE G.id = $1 AND GM.group_id = G.id AND U.id = GM.user_id', groupid)
    .then(function (data) { 

      var group = {}
      group["id"] = groupid;
      group["name"] = data[0]["group_name"];
      group["members"] = data.map(function (tuple) {
        return {
          id: tuple["user_id"],
          name: tuple["name"]
        };
      });

      res.status(200)
        .json({
          status: 'success',
          data: group,
          message: 'Retrieved user data'
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function getAllStarships(req, res, next) {
  db.any('SELECT * FROM starships')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all starships'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getStarship(req, res, next) {
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM starships WHERE id = $1', id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved one starship'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createStarship(req, res, next) {
  req.body.launched = parseInt(req.body.launched);
  db.none('INSERT INTO starships(name, registry, affiliation, launched, class, captain)' +
      'values(${name}, ${registry}, ${affiliation}, ${launched}, ${class}, ${captain})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one starship'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateStarship(req, res, next) {
  db.none('UPDATE starships SET name=$1, registry=$2, affiliation=$3, launched=$4, class=$5, captain=$6 where id=$7',
    [req.body.name, req.body.registry, req.body.affiliation, parseInt(req.body.launched), req.body.class, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated starship'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeStarship(req, res, next) {
  var id = parseInt(req.params.id);
  db.result('DELETE FROM starships WHERE id = $1', id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount} starships'
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}


/////////////
// Exports
/////////////

module.exports = {
    getUser: getUser,
    getGroupInfo: getGroupInfo,
    getAllStarships: getAllStarships,
    getStarship: getStarship,
    createStarship: createStarship,
    updateStarship: updateStarship,
    removeStarship: removeStarship
};