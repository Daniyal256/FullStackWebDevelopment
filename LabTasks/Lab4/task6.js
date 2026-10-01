let x = 4;
let y = 6;
let z = 30;

let sum = 0;

for (let i = 1; i < z; i++) {
    if (i % x === 0 || i % y === 0) {
        sum = sum + i;
    }
}

console.log("Sum of multiples of " + x + " and " + y + " below " + z + ": " + sum);