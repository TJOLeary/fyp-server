module.exports = function(server, db) {

  console.log('loaded manageCoords.js');

  //Get all coordinates from x radius given a location of y
  // server.get('/api/v1/safetyCoords/findLocalCoords', function(req, res, next) {
  //
  //   query.location = {
  //     $near: {
  //       $geometry: {
  //         type: "Point",
  //         coordinates: [50.744186, -1.897920]
  //       },
  //       $maxDistance: 1000
  //     }
  //   }
  //
  //   db.fypSafetyCoords.find(
  //     query,
  //     function(err, list) {
  //       res.writeHead(200, {
  //         'Content-Type': 'application/json; charset=utf-8'
  //       });
  //       res.end(JSON.stringify(list));
  //     });
  //   return next();
  // });


  //Add new coord into db
  // server.post('/api/v1/safetyCoords/addUserCoord', function(req, res, next) {
  //
  //   var userCoord = req.params;
  //   console.log(userCoord + "user coord")
  //   db.fypSafetyCoords.insert(userCoord,
  //
  //     function(err, data) {
  //       console.log("data"+data);
  //       res.writeHead(200, {
  //         'Content-Type': 'application/json; charset=utf-8'
  //       });
  //       res.end(JSON.stringify(data));
  //     });
  //
  //   return next();
  // });

  //Upvote coord by id
  server.put('/api/v1/safetyCoords/upvoteUserCoord/:id', function(req, res, next) {
    //find coordinate by object ID
    db.fypSafetyCoords.findOne({
      _id: db.ObjectId(req.params.id)
    }, function(err, data) {
      //increase safe_count by 1
      var safeCount = {
        $inc: {
          safe_count: 1
        }
      };

      db.fypSafetyCoords.update({
        _id: db.ObjectId(req.params.id)
      }, safeCount, function(err, data) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(data));
      });
    });

    return next();
  });

}
