/**
 * Created by Szane on 2016/6/13.
 */
const INF = 0xffffff;
const MAX = 100;
var lx = new Array(MAX), ly = new Array(MAX);
var match = new Array(MAX);
var visX = new Array(MAX), visY = new Array(MAX);
var slack = new Array(MAX);

function path(u, ny, weight) {
    console.log('start path');
    visX[u] = true;
    for (var v = 0; v < ny; v++) {
        if (visY[v]) {
            console.log('visY' + v);
            continue;
        }

        var t = lx[u] + ly[v] - weight[u][v];
        if (t == 0) {
            visY[v] = true;
            if (match[v] == -1 || path(match[v], ny, weight)) {
                if (match[v] == -1)
                    console.log(v + 'untouch');
                else
                    console.log('path');
                match[v] = u;
                console.log(u + '-' + v);
                return true;
            }
        }
        else if (slack[v] > t) {
            slack[v] = t;
            console.log('slack' + v + '-' + slack[v]);
        }
    }
    return false;
}
function bestMatch(nx, ny, weight) {
    for (var k = 0; k < match.length; k++) {
        match[k] = -1;
    }
    console.log(weight);
    // 初始化标号
    for (var j = 0; j < ly.length; j++)
        ly [j] = 0;
    for (var i = 0; i < lx.length; i++)
        lx [i] = 0;
    for (i = 0; i < nx; i++)
        for (j = 0; j < ny; j++)
            if (lx [i] < weight [i] [j])
                lx [i] = weight [i] [j];
    for (var u = 0; u < nx; u++) {
        for (i = 0; i < ny; i++)
            slack[i] = INF;
        while (true) {
            console.log('u=' + u);
            for (i = 0; i < nx; i++) {
                console.log('lx-' + lx [i]);
            }
            for (j = 0; j < ny; j++) {
                console.log('ly-' + ly [j]);
            }
            for (i = 0; i < visX.length; i++) {
                visX[i] = 0;
            }
            for (i = 0; i < visY.length; i++) {
                visY[i] = 0;
            }
            if (path(u, ny, weight)) {
                console.log('find' + u);
                break;
            }
            var dx = INF;
            for (i = 0; i < ny; i++) {
                if (!visY[i] && dx > slack[i]) {
                    dx = slack[i];
                }
            }
            console.log('dx-' + dx);
            for (i = 0; i < nx; i++) {
                if (visX[i])
                    lx[i] -= dx;
            }
            for (i = 0; i < ny; i++) {
                if (visY[i])
                    ly[i] += dx;
                else
                    slack[i] -= dx;
            }
        }
    }
    var sum = 0;
    for (i = 0; i < ny; i++) {
        if (match[i] > -1) {
            sum += parseInt(weight[match[i]][i]);
        }
    }
    return sum;
}
module.exports = {
    match: match,
    bestMatch: bestMatch
};