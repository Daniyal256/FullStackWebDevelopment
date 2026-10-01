var name = "Daniyal Haider";       // String
var age = 20;                      // Number
var isStudent = true;              // Boolean
var university = "Air University"; // String
var degree = "Computer Science";   // String
var semester = 5;                  // Number
var city = "Rawalpindi";           // String

console.log("Biography as variables..........\n");

console.log("My name is " + name + ".");
console.log("I am " + age + " years old.");
console.log("I am a student: " + isStudent);
console.log("I study at " + university + ".");
console.log("My degree program is " + degree + ".");
console.log("I am currently in semester " + semester + ".");
console.log("I live in " + city);

// Biography as an object
var biography = {
    name: "Daniyal Haider",
    age: 20,
    isStudent: true,

    address: {
        city: "Rawalpindi",
        country: "Pakistan"
    },

    degreeProgram: {
        degree: "Computer Science",
        university: "Air University",
        semester: 5
    }
};

console.log("\n\nBiography as an object..........\n");

for (var key in biography) {

    if (typeof biography[key] === "object") {
        console.log(key + ":");

        for (var subKey in biography[key]) {
            console.log(subKey + ": " + biography[key][subKey]);
        }

    } else {
        console.log(key + ": " + biography[key]);
    }
}