var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var Scraper = require ('images-scraper')
const download = require('image-downloader')
var async=require('async')
var Jimp = require("jimp");
var google = new Scraper.Google();
var Schema = mongoose.Schema;
var image = Schema({
  	keyword: String,
	  imagesUrl:[],

}, {
  collection: 'imageSearch'
});
var SearchImage = mongoose.model('SearchImage', image);
mongoose.connect('mongodb://localhost/darwin', { useMongoClient: true });
mongoose.Promise = global.Promise;

//index page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//keyword page
router.get('/keywords', function(req, res, next) {
  SearchImage.find({}, function (err, docs) {
    res.render('keywords', { keys:docs  });
  });
});

//selected keyword
router.get('/keywords/:keyword', function(req, res, next) {
  SearchImage.findOne({'keyword':req.params.keyword}, 'imagesUrl',function (err, docs) {
    console.log(docs);
    res.render('selectedKey', { 'urls':docs.imagesUrl ,'key':req.params.keyword  });
  });
});

router.post('/imageSearch', function(req, res, next) {
  google.list({
      keyword: req.body.text,
      num: 20,
      detail: true,
      nightmare: {
          show: true
      }
  })
  .then(function (result) {
    var urls=[];

    async.forEachOf(result,function(value,key,callback){
      const options = {
        url: value.url,
        dest: 'images/googleSearch'                  // Save to /path/to/dest/image.jpg
      }
      async function downloadIMG() {
        try {
          const { filename, image } = await download.image(options)
          console.log(filename) // => /path/to/dest/image.jpg
          urls.push(filename.replace("images\\",""))
          Jimp.read(filename).then(function (image) {
              // do stuff with the image
              image.quality(50)
                  .grayscale()
                  .write(filename)
          }).catch(function (err) {
              // handle an exception
              console.log('jimp image compressor erro',err);
          });
        } catch (e) {
            return callback(e);
        }
        callback();
      }
      downloadIMG();
        //urls.push('images/googleSearch/'+value.url.split('\\').pop().split('/').pop())
    },function(err){
      if(err) console.error(err.message);
      imageUploadAndCompressionDone(urls)
    });
    function imageUploadAndCompressionDone(item) {
      //var imageData = new SearchImage({ keyword: req.body.text, imagesUrl:item });
      // imageData.save(function (err) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log('datasaved');
      //   }
      // });
      var query = {'keyword': req.body.text};

      SearchImage.findOneAndUpdate(query, { keyword: req.body.text, imagesUrl:item }, {upsert:true}, function(err, doc){
          if (err) return res.send(500, { error: err });
          console.log("done saving");
      });
      res.send(item);
    }


  })
  .catch(function(err) {
      console.log('err', err);
  });

// you can also watch on events
  google.on('result', function (item) {
      console.log('out', item);
  });
});

module.exports = router;
