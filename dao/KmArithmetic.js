/**
 * Created by Szane on 2016/5/28.
 */

var INF = 0xffffff;
var MAX = 2000;
var weight = [];
var lx = [MAX], ly = [MAX];
var match = [MAX];
var visX = [MAX], visY = [MAX];
var slack = [MAX];
var nx, ny;

function initVertex() {
    // 初始化标号
    for (var i = 0; i < nx; i++) {
        lx [i] = -INF;
        for (var j = 0; j < ny; j++)
            ly [j] = 0;
        if (lx [i] < weight [i] [j])
            lx [i] = weight [i] [j];
    }
    for (var k = 0; k < MAX; k++) {
        match[k] = -1;
    }
}
function path(u) {
    visX[u] = true;
    for (var v = 0; v < ny; v++) {
        if (visY[v])
            continue;
        var t = lx[u] + ly[v] - weight[u][v];
        if (t == 0) {
            visY[v] = true;
            if (match[v] == -1 || path(match[v])) {
                match[v] = u;
                return true;
            }
        }
        else if (slack[v] > t) {
            slack[v] = t;
        }
    }
    return false;
}
function bestmatch() {
    initVertex();
    for (var u = 0; u < nx; u++) {
        for (var i = 0; i < ny; i++) {
            slack[i] = INF;
        }
        while (1) {
            for (i = 0; i < nx; i++) {
                visX[i] = 0;
            }
            for (i = 0; i < ny; i++) {
                visY[i] = 0;
            }
            if (path(u))
                break;
            var dx = INF;
            for (i = 0; i < ny; i++) {
                if (!visY[i] && dx > slack[i]) {
                    dx = slack[i];
                }
            }
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
            console.log(weight[match[i]][i]);
            sum += parseInt(weight[match[i]][i]);
        }
    }
    return sum;
}
module.exports = {
    weight: weight,
    match: match,
    nx: nx,
    ny: ny,
    bestmatch: bestmatch
};