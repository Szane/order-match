// /**
//  * Created by Szane on 2016/5/25.
//  */
// const readline = require('readline');
// const fs = require('fs');
//
// const rl = readline.createInterface({
//     // input: fs.createReadStream('c:\\test.csv')
// });
// const Seq = require('seq');
// var INF = 0xffffff;
// var MAX = 2000;
// var weight = [];
// var lx = [MAX], ly = [MAX];
// var match = [MAX];
// var visX = [MAX], visY = [MAX];
// var slack = [MAX];
// var nx, ny;
//
// function initVertex() {
//     // 初始化标号
//     for (var i = 0; i < nx; i++) {
//         lx [i] = -INF;
//         for (var j = 0; j < ny; j++)
//             ly [j] = 0;
//         if (lx [i] < weight [i] [j])
//             lx [i] = weight [i] [j];
//     }
//     for (var k = 0; k < MAX; k++) {
//         match[k] = -1;
//     }
// }
// function path(u) {
//     visX[u] = true;
//     for (var v = 0; v < ny; v++) {
//         if (visY[v])
//             continue;
//         var t = lx[u] + ly[v] - weight[u][v];
//         if (t == 0) {
//             visY[v] = true;
//             if (match[v] == -1 || path(match[v])) {
//                 match[v] = u;
//                 return true;
//             }
//         }
//         else if (slack[v] > t) {
//             slack[v] = t;
//         }
//     }
//     return false;
// }
// function bestmatch() {
//     initVertex();
//     for (var u = 0; u < nx; u++) {
//         for (var i = 0; i < ny; i++) {
//             slack[i] = INF;
//         }
//         while (1) {
//             for (i = 0; i < nx; i++) {
//                 visX[i] = 0;
//             }
//             for (i = 0; i < ny; i++) {
//                 visY[i] = 0;
//             }
//             if (path(u))
//                 break;
//             var dx = INF;
//             for (i = 0; i < ny; i++) {
//                 if (!visY[i] && dx > slack[i]) {
//                     dx = slack[i];
//                 }
//             }
//             for (i = 0; i < nx; i++) {
//                 if (visX[i])
//                     lx[i] -= dx;
//             }
//             for (i = 0; i < ny; i++) {
//                 if (visY[i])
//                     ly[i] += dx;
//                 else
//                     slack[i] -= dx;
//             }
//         }
//     }
//     var sum = 0;
//     for (i = 0; i < ny; i++) {
//         if (match[i] > -1) {
//             console.log(weight[match[i]][i]);
//             sum += parseInt(weight[match[i]][i]);
//         }
//     }
//     return sum;
// }
// // (function main() {
// //     Seq().seq(function () {
// //         var that = this;
// //         rl.on('line', function (line) {
// //             var yVertex = line.split(",");
// //             for (var i = 0; i < yVertex.length; i++) {
// //                 if (parseInt(yVertex[i]) < 63) {
// //                     yVertex[i] = 0;
// //                 }
// //             }
// //             weight.push(yVertex);
// //         }).on('close', function () {
// //             that();
// //         });
// //     }).seq(function () {
// //         nx = weight.length;
// //         ny = weight[0].length;
// //         var cost = bestmatch();
// //         console.log(cost + "\n");
// //         for (var i = 0; i < ny; i++) {
// //             if (match[i] > -1) {
// //                 console.log("X" + match[i] + ",Y" + i);
// //             }
// //         }
// //     });
// //
// //     // nx = 2;
// //     // ny = 3;
// //     // weight = [[], []];
// //     // weight[0][0] = 2;
// //     // weight[0][1] = 3;
// //     // weight[0][2] = 2;
// //     // weight[1][0] = 1;
// //     // weight[1][1] = 2;
// //     // weight[1][2] = 4;
// //     // console.log(weight);
// //
// // })();
//
//
//
//
//
//
