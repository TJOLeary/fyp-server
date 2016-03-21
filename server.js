// ###################
// ###################
// Server config
// ###################
// ###################

var restify = require('restify');
var mongoose = require('mongoose');
var morgan = require('morgan');

var server = restify.createServer();

//init restify and enable logging (morgan)
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(morgan('dev')); // LOGGER

//enable cross origin request sharing so client can talk to any domain (i.e. my server)
server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header( 'Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//start up server
server.listen(process.env.PORT || 8080, function() {
  console.log("Server started at", process.env.PORT || 8080);
});

// ###################
// ###################
// Database config
// ###################
// ###################

mongoose.connect('mongodb://localhost/CoordDB');
var db = mongoose.connection;
db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});

var Schema = mongoose.Schema;
var coordSchema = new Schema({
uuid : String,
location: [Number],
safe_count:  {type: Number, default: 0},
unsafe_count: {type: Number, default: 0},
created_at: {type: Date, default: Date.now},
updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
coordSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();

});
// Indexes this schema in 2dsphere format
coordSchema.index({location: '2dsphere'});
//new location model
mongoose.model('Location', coordSchema)
var Location = mongoose.model('Location');


// ###################
// ###################
// REST API
// ###################
// ###################

//add Location function
var postCoord = function(req,res,next){
  var newCoordinates = req.params;
  JSON.stringify(newCoordinates);
  var newLocation = new Location(newCoordinates);

  newLocation.save(newCoordinates, function (err, data) {
    if (err) console.log(err);
    else console.log('Saved : ', data );
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  });
}

//get All locations function
var getAllCoords = function(req,res,next){
  Location.find({}).exec(function (arr,data) {
    console.log('Entries : ', data );
    res.send(JSON.stringify(data));
  });
}

  //50.716135,-1.986723 works
//get locations within a 5000m radius, near a given location
var getCoordsNear = function(req,res,next){

var longitude = parseFloat(req.params.long)
var latitude = parseFloat(req.params.lat)

  Location.find({
    location: {
      $near : {
        $geometry : {
          coordinates : [longitude,latitude]
        },
        $maxDistance : 5000
      }
    }
  }).exec(function (arr,data) {
    console.log('Entries : ', data );
    res.send(JSON.stringify(data));
  });
}

//get one location
var getOneLocationById = function(req,res,next){

  Location.findOne( {_id: req.params.id}).exec(function (arr,data) {
    console.log('The returned location: ', data );
    res.send(JSON.stringify(data));
  });

}

//upvote or downvote a location
var voteOnLocationSafety = function(req,res,next){
  console.log(req.params.objectid)
  console.log(req.params.vote);
    Location.findOne({_id: req.params.objectid}, function(err, data){

      console.log(JSON.stringify(data));

      if (req.params.vote == "yes"){
        data.safe_count += 1
        data.save(function(err){
          if (err) console.log(err);
          else console.log('updated : ', data );
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(data));
        })
      }
      else if(req.params.vote == "no"){
        data.unsafe_count += 1
        data.save(function(err){
          if (err) console.log(err);
          else console.log('updated : ', data );
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(data));
        })
      }
      else if(req.params.vote != "no" || req.params.vote !="yes"){
        res.writeHead(406, {'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      }
      else{
        console.log(err);
      }
    })
}

server.post('/addCoord', postCoord);
server.get('/getAllCoords',getAllCoords);
server.get('/getCoordsNear/:long/:lat',getCoordsNear);
server.get('/find/:id',getOneLocationById);
server.put('/vote/:objectid/:vote', voteOnLocationSafety)
