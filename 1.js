
const student = {
  name: "Daniyal haider",
  age: 20,
  subjects: {
    FSWD: 85,
    OS: 90
  }
};

for (const [key, value] of Object.entries(student)) {
  if (typeof value === "object") {
    for (const [subKey, subValue] of Object.entries(value)) {
      console.log(`${subKey}: ${subValue}`);
    }
  } else {
    console.log(`${key}: ${value}`);
  }
}