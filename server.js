const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

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

app.get('/newpost', function(req, res){
	res.render('write.ejs');
});

app.post('/add', function(req, res){
	db.collection('counter').findOne({name : '게시물갯수'}, function(err, result){
		var totalPost = result.totalPost + 1
		db.collection('post').insertOne( {_id : totalPost, title : req.body.title ,contents : req.body.contents} , function(err, result){
			console.log('저장완료'); 
			db.collection('post').find().toArray(function(err, postresult){
				db.collection('post').count(function(err, totalNumber){
					res.render('list.ejs', {name : postresult, number : totalNumber });
					console.log(postresult , totalNumber);
				});
			});
			db.collection('counter').updateOne({name : '게시물갯수'},{$inc : {totalPost : 1}});
		});
	});
});
app.get('/search', function(req, res){
	console.log(req.query.value)
	db.collection('post').find({title:req.query.value}).toArray(function(err, result){
		console.log(result);
		res.render('list.ejs', {name : result });
	})
});

app.get('/', function(req, res){
	db.collection('post').find().toArray(function(err, postresult){
		db.collection('post').count(function(err, totalNumber){
			res.render('list.ejs', {name : postresult, number : totalNumber });
			console.log(postresult , totalNumber);
		});
	});
});

app.delete('/delete', function(req, respon){
	console.log(req.body);
	req.body._id = parseInt(req.body._id);
	db.collection('post').deleteOne(req.body, function(err, res){
		console.log('삭제 완료');
		respon.status(200).send({ message : '성공'});
	});
});

app.get('/detail/:id',function(req, respon){
	db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
		console.log(result);
		if(result !== null){
			respon.render('detail.ejs', {data : result});
		} else {
			respon.send('404 Not Found');
		}
	});
});

app.get('/edit/:id',function(req, respon){
	db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
		console.log(result);
		if(result !== null){
			respon.render('edit.ejs', {data : result});
		} else {
			respon.send('404 Not Found');
		}
	});
});

app.post('/update/:id', function(req, respon){
	db.collection('post').updateOne({_id : parseInt(req.params.id)},{$set : {title : req.body.title ,contents : req.body.contents}}, function(err, result){
		console.log(result);
		if(result !== null){
			db.collection('post').find().toArray(function(err, postresult){
				db.collection('post').count(function(err, totalNumber){
					respon.render('list.ejs', {name : postresult, number : totalNumber });
					console.log(postresult , totalNumber);
				});
			});
		} else {
			respon.send('404 Not Found');
		}	
	});
});