function formatTimeZone(time,offset){
    var d=new Date(time); //创建一个Date对象 time时间 offset 时区  中国为  8
    var localTime = d.getTime();
    var wishTime = localTime + (3600000*offset); 
    return new Date(wishTime); 
}