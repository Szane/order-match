/**
 * Created by Szane on 2016/6/7.
 */
var distanceDAO = require('../dao/DistanceDAO.js');
var Seq = require('seq');
var regionDAO = require('../dao/RegionDAO.js');
var config = require('../Config/Config.js');

function getDistance(req, res, next) {
    var params = req.params;
    Seq().seq(function () {
        var that = this;
        distanceDAO.genDistanceSn(params, function (result) {
            params.sn = result;
            that();
        });
    }).seq(function () {
        distanceDAO.getDistance(params, function (result) {
            res.send(result);
            return next();
        });
    });
}
function getLocation(req, res, next) {
    var params = req.params;
    Seq().seq(function () {
        var that = this;
        distanceDAO.genLocationSn(params, function (result) {
            params.sn = result;
            that();
        });
    }).seq(function () {
        distanceDAO.getLocation(params, function (result) {
            res.send(result);
            return next();
        });
    });
}

function fetchNewDistance(req, res, next) {
    var params = req.params;
    var startLoc;
    var endLoc;
    var subParams = {
        address: params.startAddress
    };
    Seq().seq(function () {
        var that = this;
        distanceDAO.genLocationSn(subParams, function (result) {
            subParams.sn = result;
            that();
        });
    }).seq(function () {
        var that = this;
        distanceDAO.getLocation(subParams, function (result) {
            startLoc = result.geocodes[0].location;
            that();
        });
    }).seq(function () {
        subParams.address = params.endAddress;
        var that = this;
        distanceDAO.genLocationSn(subParams, function (result) {
            subParams.sn = result;
            that();
        });
    });
}
function initDistances(req, res, next) {
    var params = {};
    var counties = [];
    Seq(config.cities).seqEach(function (city, i) {
        var that = this;
        var subParams = {
            pid: city.id
        };
        regionDAO.querySubRegion(subParams, function (error, rows) {
            rows.forEach(function (row) {
                if (row) {
                    row.city = city.name;
                    counties.push(row);
                }
            });
            that(null, i);
        });
    }).seq(function () {
        var that = this;
        Seq(counties).seqEach(function (county, i) {
            var that = this;
            params.address = county.name;
            params.city = county.city;
            Seq().seq(function () {
                var that = this;
                distanceDAO.genLocationSn(params, function (result) {
                    params.sn = result;
                    that();
                });
            }).seq(function () {
                var that = this;
                distanceDAO.getLocation(params, function (result) {
                    if (result && result.status == 1) {
                        if (result.count > 0) {
                            var loc = result.geocodes[0].location.split(",");
                            county.lng = loc[0];
                            county.lat = loc[1];
                        } else {
                            console.log("not found " + params.city + params.address);
                        }
                        that();
                    }
                    else {
                        console.log('remote query location error');
                    }
                });
            }).seq(function () {
                that(null, i);
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        var that = this;
        Seq(counties).seqEach(function (county, j) {
            var that = this;
            var subParams = {};
            Seq().seq(function () {
                var that = this;
                params.destination = county.lng + "," + county.lat;
                params.origin = config.harbour.lng + "," + config.harbour.lat;
                distanceDAO.genDistanceSn(params, function (result) {
                    params.sn = result;
                    that();
                });
            }).seq(function () {
                var that = this;
                distanceDAO.getDistance(params, function (result) {
                    if (result && result.status == 1) {
                        subParams.distance = result.route.paths[0].distance;
                        subParams.endZipcode = county.id;
                        subParams.startZipcode = config.harbour.zipcode;
                        subParams.endLng = county.lng;
                        subParams.endLat = county.lat;
                        subParams.startLng = config.harbour.lng;
                        subParams.startLat = config.harbour.lat;
                        subParams.notfound = false;
                    } else {
                        subParams.notfound = true;
                        console.log(result);
                    }
                    that();
                });
            }).seq(function () {
                var that = this;
                if (!subParams.notfound) {
                    distanceDAO.addDistance(subParams, function (error, result) {
                        if (error) {
                            console.log("addDistance error");
                        } else {
                            if (result && result.insertId) {
                                console.log(county);
                                that();
                            }
                        }
                    });
                } else {
                    that();
                }
            }).seq(function () {
                that(null, j);
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        var that = this;
        Seq(counties).seqEach(function (county, j) {
            var that = this;
            var subParams = {};
            Seq().seq(function () {
                var that = this;
                params.origin = county.lng + "," + county.lat;
                params.destination = config.harbour.lng + "," + config.harbour.lat;
                distanceDAO.genDistanceSn(params, function (result) {
                    params.sn = result;
                    that();
                });
            }).seq(function () {
                var that = this;
                distanceDAO.getDistance(params, function (result) {
                    if (result && result.status == 1) {
                        subParams.distance = result.route.paths[0].distance;
                        subParams.startZipcode = county.id;
                        subParams.endZipcode = config.harbour.zipcode;
                        subParams.startLng = county.lng;
                        subParams.startLat = county.lat;
                        subParams.endLng = config.harbour.lng;
                        subParams.endLat = config.harbour.lat;
                        subParams.notfound = false;
                    } else {
                        subParams.notfound = true;
                        console.log(result);
                    }
                    that();
                });
            }).seq(function () {
                var that = this;
                if (!subParams.notfound) {
                    distanceDAO.addDistance(subParams, function (error, result) {
                        if (error) {
                            console.log("addDistance error");
                        } else {
                            if (result && result.insertId) {
                                console.log(county);
                                that();
                            }
                        }
                    });
                } else {
                    that();
                }
            }).seq(function () {
                that(null, j);
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        var that = this;
        Seq(config.yards).seqEach(function (yard, i) {
            var that = this;
            cb(yard, i, function (yard, i) {
                Seq(counties).seqEach(function (county, j) {
                    var that = this;
                    var subParams = {};
                    cb(county, j, function (county, j) {
                        Seq().seq(function () {
                            var that = this;
                            params.origin = county.lng + "," + county.lat;
                            params.destination = yard.lng + "," + yard.lat;
                            distanceDAO.genDistanceSn(params, function (result) {
                                params.sn = result;
                                that();
                            });
                        }).seq(function () {
                            var that = this;
                            distanceDAO.getDistance(params, function (result) {
                                if (result && result.status == 1) {
                                    subParams.distance = result.route.paths[0].distance;
                                    subParams.startZipcode = county.id;
                                    subParams.endZipcode = yard.zipcode;
                                    subParams.startLng = county.lng;
                                    subParams.startLat = county.lat;
                                    subParams.endLng = yard.lng;
                                    subParams.endLat = yard.lat;
                                    subParams.notfound = false;
                                } else {
                                    subParams.notfound = true;
                                    console.log(result);
                                }
                                that();
                            });
                        }).seq(function () {
                            var that = this;
                            if (!subParams.notfound) {
                                distanceDAO.addDistance(subParams, function (error, result) {
                                    if (error) {
                                        console.log("addDistance error");
                                    } else {
                                        if (result && result.insertId) {
                                            console.log(county);
                                            that();
                                        }
                                    }
                                });
                            } else {
                                that();
                            }
                        }).seq(function () {
                            that(null, j);
                        });
                    });
                }).seq(function () {
                    console.log(yard.name);
                    that(null, i);
                });
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        var that = this;
        Seq(config.yards).seqEach(function (yard, i) {
            var that = this;
            cb(yard, i, function (yard, i) {
                Seq(counties).seqEach(function (county, j) {
                    var that = this;
                    var subParams = {};
                    cb(county, j, function (county, j) {
                        Seq().seq(function () {
                            var that = this;
                            params.destination = county.lng + "," + county.lat;
                            params.origin = yard.lng + "," + yard.lat;
                            distanceDAO.genDistanceSn(params, function (result) {
                                params.sn = result;
                                that();
                            });
                        }).seq(function () {
                            var that = this;
                            distanceDAO.getDistance(params, function (result) {
                                if (result && result.status == 1) {
                                    subParams.distance = result.route.paths[0].distance;
                                    subParams.endZipcode = county.id;
                                    subParams.startZipcode = yard.zipcode;
                                    subParams.endLng = county.lng;
                                    subParams.endLat = county.lat;
                                    subParams.startLng = yard.lng;
                                    subParams.startLat = yard.lat;
                                    subParams.notfound = false;
                                } else {
                                    subParams.notfound = true;
                                    console.log(result);
                                }
                                that();
                            });
                        }).seq(function () {
                            var that = this;
                            if (!subParams.notfound) {
                                distanceDAO.addDistance(subParams, function (error, result) {
                                    if (error) {
                                        console.log("addDistance error");
                                    } else {
                                        if (result && result.insertId) {
                                            console.log(county);
                                            that();
                                        }
                                    }
                                });
                            } else {
                                that();
                            }
                        }).seq(function () {
                            that(null, j);
                        });
                    });
                }).seq(function () {
                    console.log(yard.name);
                    that(null, i);
                });
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        var that = this;
        

    }).seq(function () {
        
        console.log("done");
    });
}
function cb(value, i, callback) {
    callback(value, i);
}
module.exports = {
    getDistance: getDistance,
    getLocation: getLocation,
    initDistances: initDistances
};
