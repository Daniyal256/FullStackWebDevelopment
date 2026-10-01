let givenPrime = 8;
let number = givenPrime + 1;

while (true) {
    let isPrime = true;

    for (let i = 2; i < number; i++) {
        if (number % i === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        console.log("Prime number after " + givenPrime + " is " + number);
        break;
    }

    number++;
}