const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ urlencoded: true, extended: true }));
router.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.route('/')
    .get(function(req, res, next) {
        mongoose.model('Blob').find({}, function (err, blobs) {
            if(err) {
                return console.error(err);
            }
            else {
                res.format({
                    html: function() {
                        res.render('blobs/index', {
                            title: 'All my Blobs',
                            "blobs": blobs
                        });
                    },

                    json: function() {
                        res.json(blobs);
                    }
                });
            }
        });
    })
    .post(function(req, res) {
        const name = req.body.name;
        const badge = req.body.badge;
        const dob = req.body.dob;
        const isloved = req.body.isloved;
        
        mongoose.model('Blob').create({
            name: name,
            badge: badge,
            dob: dob,
            isloved: isloved
        }, function(err, blob) {
            if(err) {
                res.send("There was a problem adding the information to the database."+err+". isloved: "+isloved);
            }
            else {
                console.log('POST creating new blob: '+blob);

                res.format({
                    html: function() {
                        res.location("blobs");
                        res.redirect("/blobs");
                    },

                    json: function() {
                        res.json(blob);
                    }
                });
            }
        });
    });

router.get('/new', function(req, res) {
    res.render('blobs/new', { title: 'Add New Blob' });
});

router.param('id', function(req, res, next, id) {
    mongoose.model('Blob').findById(id, function (err, blob) {
        if(err) {
            console.log(id+' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;

            res.format({
                html: function() {
                    next(err);
                },

                json: function() {
                    res.json({message: err.status+' '+err});
                }
            });
        }
        else {
            req.id = id;
            next();
        }
    });
});

router.route('/:id')
    .get(function(req, res) {
        mongoose.model('Blob').findById(req.id, function(err, blob) {
            if(err) {
                console.log('GET Error: There was a problem retrieving: '+err);
            }
            else {
                console.log('GET Retrieving ID: '+blob._id);
                var blobdob = blob.dob.toISOString();
                blobdob = blobdob.substring(0, blobdob.indexOf('T'));
                res.format({
                    html: function() {
                        res.render('blobs/show', {
                            "blobdob": blobdob,
                            "blob": blob
                        });
                    },
                    json: function() {
                        res.json(blob);
                    }
                });
            }
        });
    });

router.get('/:id/edit', function(req, res) {
    mongoose.model('Blob').findById(req.id, function(err, blob) {
        if(err) {
            console.log('GET Error: There was a problem retrieving: '+err);
        }
        else {
            console.log('GET Retrieving ID: '+blob._id);

            var blobdob = blob.dob.toISOString();
            blobdob = blobdob.substring(0, blobdob.indexOf('T'));

            res.format({
                html: function() {
                    res.render('blobs/edit', {
                        title: 'Blob'+blob._id,
                        "blobdob": blobdob,
                        "blob": blob
                    });
                },

                json: function() {
                    res.json(blob);
                }
            });
        }
    });
});

router.put('/:id/edit', function(req, res) {
    var name = req.body.name;
    var badge = req.body.badge;
    var dob = req.body.dob;
    var isloved = req.body.isloved;

    mongoose.model('Blob').findById(req.id, function (err, blob) {
        blob.updateOne({
            name : name,
            badge : badge,
            dob : dob,
            isloved : isloved
        }, function (err, blobID) {
          if (err) {
              res.send("There was a problem updating the information to the database: " + err);
          } 
          else {
                  res.format({
                      html: function(){
                           res.redirect("/blobs/" + blob._id);
                     },

                    json: function(){
                           res.json(blob);
                     }
                });
            }
        });
    });
});

router.delete('/:id/edit', function (req, res){
    mongoose.model('Blob').findById(req.id, function (err, blob) {
        if (err) {
            return console.error(err);
        } else {
            blob.remove(function (err, blob) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log('DELETE removing ID: ' + blob._id);
                    res.format({
                        
                          html: function(){
                               res.redirect("/blobs");
                         },
                        
                        json: function(){
                               res.json({message : 'deleted',
                                   item : blob
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;












