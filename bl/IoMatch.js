/**
 * Created by Szane on 2016/5/28.
 */

var grade = require('../dao/Grade.js');
var km = require('../dao/KmArithmetic.js');
var Seq = require('seq');
var fs = require('fs');
var serverLogger = require('./../ServerLogger.js');
var logger = serverLogger.createLogger('IoMatch.js');
function getIoMatchResult() {
    var weight = [
        // [740, 882, 882, 676, 676],
        // [676, 746, 746, 676, 676],
        // [740, 882, 882, 676, 676],
        // [676, 746, 746, 676, 676],
        // [678, 749, 749, 676, 676]];
        // [740, 740, 740, 882, 882, 882],
        // [676, 676, 676, 746, 746, 746],
        // [676, 676, 676, 746, 746, 746],
        // [676, 676, 676, 746, 746, 746],
        // [678, 678, 678, 749, 749, 749],
        // [678, 678, 678, 749, 749, 749],
        // [678, 678, 678, 749, 749, 749]
        // [1, 5, 3, 4, 5],
        // [11, 12, 13, 14, 15],
        // [11, 12, 13, 14, 15],
        // [11, 12, 13, 14, 15],
        // [1, 5, 3, 4, 5],
        // [4, 3, 9, 4, 5],
        // [9, 1, 7, 6, 8],
        // [4, 4, 1, 5, 3],
        // [4, 7, 7, 7, 8]
        // [9, 7, 1, 7],


        // [676, 676, 746, 746],
        // [676, 676, 746, 746],
        // [740, 740, 682, 682],
        // [878, 878, 749, 749],
        // [878, 878, 749, 749],
        // [740, 740, 682, 682]
        // [6, 4, 2, 2],
        // [3, 1, 4, 7],
        // [4, 6, 5, 7],
        // [3, 1, 4, 7],
        // [4, 6, 5, 7],

        [3, 1, 4, 7],
        [4, 6, 5, 7],
        [5, 8, 3, 8]
        // [0, 0, 0, 0]
        // [740, 740, 882, 882],
        // [676, 676, 749, 749],
        //
        // [676, 676, 749, 749],
        // [678, 678, 749, 749]
        //     [0, 0, 0, 0]

        // [11, 12, 13, 14, 15]
        // [1, 5, 3, 4, 5],
        // [11, 12, 13, 14, 15],
        // [11, 12, 13, 14, 15],
        // [11, 12, 13, 14, 15]
        // [740, 676, 676, 676, 678, 678],
        // [882, 746, 746, 746, 749, 749],
        // [882, 746, 746, 746, 749, 749],
        // [882, 746, 746, 746, 749, 749],
        // [740, 676, 676, 676, 678, 678],
        // [740, 676, 676, 676, 678, 678]
        // [808, 679, 982],
        // [649, 656, 670],
        // [848, 867, 955]

        // [740, 740, 676, 676, 678],
        // [882, 882, 746, 746, 749],
        // [882, 882, 746, 746, 749]
    ];
    var transposition = false;
    var nx = weight.length;
    if (nx > 0) {
        var ny = weight[0].length;
        // if (nx > ny)
        //     transposition = true;//进口单多，矩阵需要转置
        // if (transposition) {
        //     var w = [];
        //     for (var j = 0; j < ny; j++) {
        //         var line = [];
        //         for (var i = 0; i < nx; i++) {
        //             line.push(weight[i][j])
        //         }
        //         w.push(line)
        //     }
        //     console.log(w);
        //     nx = w.length;
        //     ny = w[0].length;
        //     weight = w;
        // }
        console.log("求全局最优匹配结果");
        var sum = km.bestMatch(nx, ny, weight);
        console.log("求解完成，全局最大值为" + sum + " 打印进出口匹配结果");
        for (var i = 0; i < ny; i++) {
            if (km.match[i] > -1)
                console.log(km.match[i] + "," + i + "," + weight[km.match[i]][i]);
        }
        console.log("匹配完成！");

    }
}
module.exports = {
    getIoMatchResult: getIoMatchResult
};