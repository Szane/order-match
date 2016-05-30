function testSeq() {
    var a1 = [1, 2, 3];
    var a2 = ['a', 'b', 'c'];
    var a3 = ['x', 'y', 'z'];

    Seq(iOrders).seqEach(function (iorder, i) {
        var that = this;
        cb(iorder, i, function (value, pos) {
            console.log(a1_item + ":" + i);
            Seq(a2).seqEach(function (a2_item, j) {
                var that = this;
                cb(a2_item, i, function (value, pos) {
                    console.log(a2_item + ":" + j);

                    Seq(a3).seqEach(function (a3_item, k) {
                        var that = this;
                        cb(a3_item, k, function (value, pos) {
                            
                            that(null, k);
                        })
                    }).seq(function () {
                        that(null, j);
                    })
                })
            }).seq(function () {
                that(null, i);
            })

        })
    }).seq(function () {
        console.log("Finished !!! ");
    })
}
function cb(value, i, callback) {
    callback(value, i);
}