require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const express = require("express");

const swaggerFile = require("./swagger-output.json");
require("./server/util/swagger");
const routes = require("./server");

try {
  const server = express();
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));
  server.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
  server.use(routes);
  server.listen(process.env.API_PORT, () =>
    console.log(`Server Online - ${process.env.API_PORT}`)
  );
  console.log(">>> Config server", { minutesDelay: process.env.DELAY });
} catch (e) {
  console.log(">>> Server Error", e);
}
