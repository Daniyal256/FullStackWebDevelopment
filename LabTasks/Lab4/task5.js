function absMe() {
    if (arguments.length === 0) {
        return 0;
    }

    if (arguments.length === 1) {
        return Math.abs(arguments[0]);
    }

    let result = [];

    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.abs(arguments[i]));
    }

    return result;
}


function ceilMe() {
    if (arguments.length === 0) {
        return 0;
    }

    if (arguments.length === 1) {
        return Math.ceil(arguments[0]);
    }

    let result = [];

    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.ceil(arguments[i]));
    }

    return result;
}


function floorMe() {
    if (arguments.length === 0) {
        return 0;
    }

    if (arguments.length === 1) {
        return Math.floor(arguments[0]);
    }

    let result = [];

    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.floor(arguments[i]));
    }

    return result;
}

console.log(absMe(-4.7));          
console.log(absMe(-4.7, -5.2));    

console.log(ceilMe(4.2));          
console.log(ceilMe(4.2, 5.7));     

console.log(floorMe(4.9));         
console.log(floorMe(4.9, 5.7));    