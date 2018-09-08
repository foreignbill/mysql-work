var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static('public'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    req.setEncoding('utf8');// need fix
    if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
    else  next();
});

app.post('/', function (req, res) {
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM GARAGE', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/check_car_plate', function (req, res) {
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM VIP WHERE car_plate="'+car_plate+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("应用实例，访问地址为 http://%s:%s", host, port);
})