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

app.post('/check_car_plate', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM VIP,PARKING_SPACE WHERE VIP.pno=PARKING_SPACE.pno AND VIP.car_plate="'+car_plate+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/check_parking_space', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM PARKING_SPACE', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/check_car_plate_on_ordertable', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM PARKING_DETAIL,PARKING_SPACE WHERE PARKING_SPACE.pno=PARKING_DETAIL.pno and PARKING_DETAIL.endtime is NULL and PARKING_DETAIL.car_plate="'+car_plate+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/insert_into_parking_detail', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var pno = req.query.pno;
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    if(month < 10) month = "0" + month;
    var day = now.getDate();            //日
    if(day < 10) day = "0" + day;
    var hh = now.getHours();            //时
    if(hh < 10) hh = "0" + hh;
    var mm = now.getMinutes();          //分
    if(mm < 10) mm = "0" + mm;
    var ss = now.getSeconds();           //秒
    if(ss < 10) ss = "0" + ss;
    var nowstr = "" + year + month + day + hh + mm + ss;
    var begtime = year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
    console.log(begtime);
    var order_no = nowstr + car_plate.substr(1,car_plate.length-1);
	var addSqlParams = [order_no,pno,car_plate,begtime,null];
	connection.query("select * from PARKING_SPACE where pno='"+pno+"'",function (error,results,fields) {
		if (error) {
			res.end(JSON.stringify("no"));
		}
		console.log(results[0].isempty == 0);
		if (results[0].isempty == 0) {
			res.end(JSON.stringify("no"));
		}
	});
	connection.query("UPDATE PARKING_SPACE set isempty=false WHERE pno='"+pno+"'",function (error,results,fields) {
		if (error) {
			res.end(JSON.stringify("no"));
		}
	});
	connection.query("Insert into PARKING_DETAIL(order_no,pno,car_plate,begtime,endtime) values(?,?,?,?,?)",addSqlParams,function (error,results) {
		if (error) {
			res.end(JSON.stringify("no"));
		}
	});
	connection.query("UPDATE PARKING_SPACE set car_plate='"+car_plate+"' WHERE pno='"+pno+"'",function (error,results,fields) {
		if (error) {
			res.end(JSON.stringify("no"));
		}
	});
	res.end(JSON.stringify("yes"));
})

app.post('/end_order', urlencodedParser, function (req, res) {
	var order_no = req.query.order_no;
	var order_price = req.query.order_price;
	var pno = req.query.pno;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	var d=new Date(); //创建一个Date对象 time时间 offset 时区  中国为  8
    var localTime = d.getTime();
    var time = new Date(localTime); 
    var m = time.getMonth() + 1;
    var t = time.getFullYear() + "-" + m + "-"
    + time.getDate() + " " + time.getHours() + ":"
    + time.getMinutes() + ":" + time.getSeconds();
    console.log(t);
	connection.connect();
	connection.query('update PARKING_DETAIL set endtime="'+t+'" where order_no="'+order_no+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.query('update PARKING_DETAIL set cost="'+order_price+'" where order_no="'+order_no+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.query('update PARKING_SPACE set isempty=true where pno="'+pno+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.query('update PARKING_SPACE set car_plate=null where pno="'+pno+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/list_order', urlencodedParser, function (req, res) {
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM PARKING_DETAIL', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/list_VIP', urlencodedParser, function (req, res) {
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM VIP', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/list_PRICE', urlencodedParser, function (req, res) {
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM PRICE', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/search_VIP', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('SELECT * FROM VIP where car_plate="'+car_plate+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/update_VIP', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var endtime = req.query.endtime;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('UPDATE VIP SET endtime="'+endtime+'" where car_plate="'+car_plate+'"', function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/new_VIP', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var endtime = req.query.endtime;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	connection.query('select * from PARKING_SPACE WHERE zone="A" AND pno not IN(SELECT pno FROM VIP)', function (error, results, fields) {
		if (error) throw error;
		res.end(JSON.stringify(results));
	});
	connection.end();
})

app.post('/create_VIP', urlencodedParser, function (req, res) {
	var car_plate = req.query.car_plate;
	var endtime = req.query.endtime;
	var pno = req.query.pno;
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root',
	  database : 'park_manager'
	});
	connection.connect();
	var addSqlParams = [pno,car_plate,endtime];
	connection.query('insert into VIP(pno,car_plate,endtime) values(?,?,?)', addSqlParams ,function (error, results) {
		if (error) throw error;
		res.end(JSON.stringify(results));
	});
	connection.end();
})

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("应用实例，访问地址为 http://%s:%s", host, port);
})