/**
 * Created by Szane on 2016/6/7.
 */
var commonUtil = require('mp-common-util');
var encrypt = commonUtil.encrypt;
var config = require('../Config/Config.js');
var http = require('http');
var db = require('../db/db.js');

function addDistance(params, callback) {
    var query = "insert into distance_info (start_zipcode,start_lat,start_lng,end_zipcode,end_lat,end_lng,distance) " +
        "values (?,?,?,?,?,?,?) ";
    var paramsArr = [], i = 0;
    paramsArr [i++] = params.startZipcode;
    paramsArr [i++] = params.startLat;
    paramsArr[i++] = params.startLng;
    paramsArr[i++] = params.endZipcode;
    paramsArr[i++] = params.endLat;
    paramsArr[i++] = params.endLng;
    paramsArr[i++] = params.distance;
    db.dbQuery(query, paramsArr, function (error, result) {
        callback(error, result);
    });
}
function genLocationSn(params, callback) {
    var queryString = "address=" + params.address + "&city=" + params.city + "&key=" + config.gaodeKey + config.gaodePKey;
    var qs = utf8Encode(queryString);
    var sn = encrypt.encryptByMd5NoKey(qs).toLowerCase();
    callback(sn);
}

function genDistanceSn(params, callback) {
    var queryString = "destination=" + params.destination + "&key=" + config.gaodeKey + "&origin=" + params.origin
        + "&strategy=0" + config.gaodePKey;
    var qs = utf8Encode(queryString);
    var sn = encrypt.encryptByMd5NoKey(qs).toLowerCase();
    callback(sn);
}
function getDistance(params, callback) {
    var url = encodeURI(config.gaodeRouteUrl + "&origin=" + params.origin +
        "&destination=" + params.destination +
        "&strategy=0" +//时间优先策略
        '&key=' + config.gaodeKey + "&sig=" + params.sn);
    http.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            data = eval("(" + data + ")");
            callback(data);
        }).on('error', function (e) {
            callback(e);
        });
    });
}

function getLocation(params, callback) {
    var url = encodeURI(config.gaodeGeoUrl + 'key=' + config.gaodeKey +
        '&address=' + params.address + "&city=" + params.city + "&sig=" + params.sn);
    http.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            data = eval("(" + data + ")");
            callback(data);
        }).on('error', function (e) {
            callback(e);
        });
    });
}
function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var encodeText = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            encodeText += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            encodeText += String.fromCharCode((c >> 6) | 192);
            encodeText += String.fromCharCode((c & 63) | 128);
        } else {
            encodeText += String.fromCharCode((c >> 12) | 224);
            encodeText += String.fromCharCode(((c >> 6) & 63) | 128);
            encodeText += String.fromCharCode((c & 63) | 128);
        }

    }
    return encodeText;
}
module.exports = {
    genLocationSn: genLocationSn,
    genDistanceSn: genDistanceSn,
    getDistance: getDistance,
    getLocation: getLocation,
    addDistance: addDistance
};