const dotenv = require("dotenv");
dotenv.config();

const mongo_port = process.env.MONGO_PORT ?? "27017";

// CONFIG File
const commonConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: "365d",
  mongoUri: "mongodb://localhost:27017/dailydoc",
  database: "chatApp",

  // dynamicEmail: true,
  // dynamicOTP: true,
};

let localConfig = {
  baseApi: "https://localhost:3010/api",
  port: "3010",
  // mongoUri: `mongodb://localhost:${mongo_port}`,,
  dbName: "chatApp",
  // dynamicEmail: true,
  // dynamicOTP: true,
};

let stagingConfig = {
  baseApi: "https://ludafix.com/api",
  port: "3010",
};

let prodConfig = {
  // baseApi: 'https://ludafix.com/api',
  // port: '3010',
  // // mongoUri: `mongodb://localhost:${mongo_port}`,
  // mongoUri: 'mongodb://localhost:27017',
  // database: 'mongodb://localhost:27017/dailydoc',
  // dbName: 'dailydoc-prod',
};

localConfig = {
  ...commonConfig,
  ...localConfig,
};

stagingConfig = {
  ...commonConfig,
  ...stagingConfig,
};

prodConfig = {
  ...commonConfig,
  ...prodConfig,
};

const env = process.env.NODE_ENV ?? "";
console.log("env");
console.log(env);

let config = null;
if (env == "local") {
  config = localConfig;
}

if (env == "staging") {
  config = stagingConfig;
}

if (env == "prod") {
  config = prodConfig;
}

config.env = env;
module.exports = config;
