/**
 * Created by Szane on 2016/6/25.
 */
function testSort() {
    var a = [
        {
            rate: 12,
            id: 1
        },
        {
            rate: 10,
            id: 2
        },
        {
            rate: 14,
            id: 3
        },
        {
            rate: 5,
            id: 4
        },
        {
            rate: 19,
            id: 5
        },
        {
            rate: 8,
            id: 6
        }
    ];
    console.log(quickSort(a));
}
var quickSort = function (arr) {
    if (arr.length <= 1) {
        return arr;
    }
    var pivotIndex = Math.floor(arr.length / 2);
    var pivot = arr.splice(pivotIndex, 1)[0];
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].rate > pivot.rate) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return quickSort(left).concat([pivot], quickSort(right));
};
module.exports = {
    testSort: testSort
};