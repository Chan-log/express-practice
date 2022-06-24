const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');

MongoClient.connect('mongodb+srv://root:go_159159159@cluster0.j1qgc.mongodb.net/todoapp?retryWrites=true&w=majority', function(er, client){
	app.listen(8080, function(){
		db = client.db('todoapp');
		console.log('listening on 8080')
	});
})

app.get('/name', function(req, res){
	res.send('닉네임');
});

app.get('/beauty', function(req, res){
	res.send('뷰티페이지');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
});

app.get('/newpost', function(req, res){
	res.sendFile(__dirname + '/write.html')
});

app.post('/add', function(req, res){
	db.collection('counter').findOne({name : '게시물갯수'}, function(err, result){
		var totalPost = result.totalPost + 1
		db.collection('post').insertOne( {_id : totalPost, title : req.body.title ,contents : req.body.contents} , function(err, result){
			console.log('저장완료'); 
			res.send('완료');
			db.collection('counter').updateOne({name : '게시물갯수'},{$inc : {totalPost : 1}});
		});
	});
});

app.get('/search', function(req, res){
	console.log(req.query.value)
	db.collection('post').find({title:req.query.value}).toArray(function(err, req){
		console.log(req);
		res.render('list.ejs', {name : req });
	})
});

app.get('/list', function(req, res){
	db.collection('post').find().toArray(function(err, postresult){
		db.collection('counter').findOne({name : '게시물갯수'}, function(err, numberresult){
			res.render('list.ejs', {name : postresult, number : numberresult });
			console.log(postresult);
		});
	});

	// res.sendFile(__dirname + '/list.html')
});