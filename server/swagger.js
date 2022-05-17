const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Reminder Pull Request",
    description:
      "Responsible application to remember if a requested pull request was forgotten in slack channel",
  },
  host: `localhost:${process.env.API_PORT}`,
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");
});
