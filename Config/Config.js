/**
 * Created by Szane on 2016/6/7.
 */
var harbour = {
    name: "青岛港",
    address: "青岛市黄岛区黄河东路88号",
    zipcode: 370211,
    lng: 120.194942,
    lat: 36.025846

};
var yards = [
    {
        name: "淄博场站",
        address: "淄博市张店区中心路299号",
        zipcode: 370303,
        lng: 118.078506,
        lat: 36.865114
    },
    {
        name: "东营场站",
        address: "东营市东营区疏港路南50米",
        zipcode: 370502,
        lng: 118.582184,
        lat: 37.448963
    },
    {
        name: "济宁场站",
        address: "济宁市兖州区迎春路西150米",
        zipcode: 370812,
        lng: 116.778383,
        lat: 35.505363
    },
    {
        name: "烟台场站",
        address: "烟台市芝罘区环海路89号",
        zipcode: 370602,
        lng: 121.369223,
        lat: 37.581787
    },
    {
        name: "威海场站",
        address: "中国外运山东有限公司威海分公司国际集装箱站(大庆路)",
        zipcode: 371002,
        lng: 120.194942,
        lat: 36.025846
    }
];
var cities = [
    {
        id: 370100,
        name: "济南市",
        pid: 370000
    },
    {
        id: 370200,
        name: "青岛市",
        pid: 370000
    },
    {
        id: 370300,
        name: "淄博市",
        pid: 370000
    },
    {
        id: 370400,
        name: "枣庄市",
        pid: 370000
    },
    {
        id: 370500,
        name: "东营市",
        pid: 370000
    },
    {
        id: 370600,
        name: "烟台市",
        pid: 370000
    },
    {
        id: 370700,
        name: "潍坊市",
        pid: 370000
    },
    {
        id: 370800,
        name: "济宁市",
        pid: 370000
    },
    {
        id: 370900,
        name: "泰安市",
        pid: 370000
    },
    {
        id: 371000,
        name: "威海市",
        pid: 370000
    },
    {
        id: 371100,
        name: "日照市",
        pid: 370000
    },
    {
        id: 371200,
        name: "莱芜市",
        pid: 370000
    },
    {
        id: 371300,
        name: "临沂市",
        pid: 370000
    },
    {
        id: 371400,
        name: "德州市",
        pid: 370000
    },
    {
        id: 371500,
        name: "聊城市",
        pid: 370000
    },
    {
        id: 371600,
        name: "滨州市",
        pid: 370000
    },
    {
        id: 371700,
        name: "菏泽市",
        pid: 370000
    }];


// var ak = "Z9T2H905MZYGks6qpURj5AXaKRpLXOtp";
// var sk = "XUdjKevAAZF7FO3MHj4ctUSD09N2BLQd";
// var routeUrl = "http://api.map.baidu.com/direction/v1/routematrix?";
// var locUrl = "http://api.map.baidu.com/geocoder/v2/?";

var gaodeKey = "2c02eaacc23fdbf4ade51e178ace8e86";
var gaodePKey = "462165c5c8a5278d879b5cd77d6f5c69";
var gaodeGeoUrl = "http://restapi.amap.com/v3/geocode/geo?";
var gaodeRouteUrl = "http://restapi.amap.com/v3/direction/driving?";

module.exports = {
    harbour: harbour,
    gaodeKey: gaodeKey,
    gaodePKey: gaodePKey,
    gaodeGeoUrl: gaodeGeoUrl,
    gaodeRouteUrl: gaodeRouteUrl,
    cities: cities,
    yards: yards
};