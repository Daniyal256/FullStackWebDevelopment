function createPhoneNumber(numbers) {
    let phone = "";

    for (let i = 0; i < numbers.length; i++) {
        if (i === 0) {
            phone += "(";
        }

        phone += numbers[i];

        if (i === 2) {
            phone += ") ";
        }

        if (i === 5) {
            phone += "-";
        }
    }

    return phone;
}
console.log("Phone number: " + createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));