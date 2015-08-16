var sortObj = function (arr, key, dir) {
    key = key || 'id';
    dir = dir || 'asc';
    if (arr.length == 0) return [];

    var left = [];
    var right = [];
    var pivot = arr[0][key];//分割值
    var pivotObj = arr[0];//存储值

    if (dir === 'asc') {//升序
        for (var i = 1; i < arr.length; i++) {
            arr[i][key] < pivot ? left.push(arr[i]) : right.push(arr[i]);
        }
    } else {//降序
        for (var i = 1; i < arr.length; i++) {
            arr[i][key] > pivot ? left.push(arr[i]) : right.push(arr[i]);
        }
    }
    return sortObj(left, key, dir).concat(pivotObj, sortObj(right, key, dir));
};

exports.sortObj = sortObj;