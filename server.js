var restify = require('restify');
var mongoose = require('mongoose');
var morgan = require('morgan');

var server = restify.createServer();
//bucketlistapp database, appUsers and bucketLists are collections (tables ish)
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

var Location = mongoose.model('Location', coordSchema);

//add Location
var postCoord = function(){
  var newLocation = new Location({
  uuid : '77gsfgs8s',
  location : [65.234, 12.11234]
  });

  newLocation.save(function (err, data) {
  if (err) console.log(err);
  else console.log('Saved : ', data );
  });

}



server.post('/addCoord', postCoord);

//init restify and enable logging (morgan)
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(morgan('dev')); // LOGGER

//enable cross origin request sharing so client can talk to any domain (i.e. my server)
server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-File-Name, Content-Type, Cache-Control' );
  next();
});

//start up server
server.listen(process.env.PORT || 8080, function() {
  console.log("Server started at", process.env.PORT || 8080);
});

//######################//
//DB SETUP
//######################//

Schema = mongoose.Schema;


//TODO get coordiantes within a radius using https://github.com/robert52/simple-geolocation/blob/master/controller.js
//http://blog.robertonodi.me/how-to-use-geospatial-indexing-in-mongodb-using-express-and-mongoose/
