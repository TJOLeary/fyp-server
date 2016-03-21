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

  // _id: db.ObjectId(req.params.location)
  //50.716135,-1.986723
//get locations near a given location
var getCoordsNear = function(req,res,next){

var longitude = parseFloat(req.params.long)
var latitude = parseFloat(req.params.lat)

  Location.find({
    location: {
      $near : {
        $geometry : {
          coordinates : [longitude,latitude]
        },
        $maxDistance : 8000
      }
    }
  }).exec(function (arr,data) {
    console.log('Entries : ', data );
    res.send(JSON.stringify(data));
  });
}




server.post('/addCoord', postCoord);
server.get('/getAllCoords',getAllCoords);
server.get('/getCoordsNear/:long/:lat',getCoordsNear);


// var databaseConfig = require('./config/database')(server, db);
// var manageCoords = require('./coordinates/manageCoords')(server, db);


//TODO get coordiantes within a radius using https://github.com/robert52/simple-geolocation/blob/master/controller.js
//http://blog.robertonodi.me/how-to-use-geospatial-indexing-in-mongodb-using-express-and-mongoose/
