const dotenv = require("dotenv");
dotenv.config({
  path: `./.env.${process.env.NODE_ENV}`,
});
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const bodyParser = require("body-parser");

const config = require("./config/index");
const Boom = require("@hapi/boom");
const express = require("express");
const app = express();

const api = require("./api/index");

const { isDef, errBuilder } = require("./api/helpers/index");

//DB Connect
const connection = require("./config/connection");
connection();

// import scriptRoutes from './routes/index';

const apiRoutes = express.Router();

//BODY-PARSER
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

////////////////////////////////////////
// server static files////////////////
///////////////////////////////////////
const publicDir = `${__dirname}/public`;
const tmpDir = `${__dirname}/public/tmp`;
const filesDir = `${__dirname}/public/files`;
const logsDir = `${__dirname}/logs`;

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
app.use("/public/files", express.static(path.join(__dirname, "public/files")));
app.use("/public/tmp", express.static(path.join(__dirname, "public/tmp")));
app.set("trust proxy", true);
app.use(morgan("combined"));
// log only 4xx and 5xx responses to console
app.use(
  morgan("dev", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);

// log all requests to access.log
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "logs", "access.log"), {
      flags: "a",
    }),
  })
);

//CORS
apiRoutes.use(api);

//DO API TOKEN VERIFY
// apiRoutes.use(async function (req, res, next) {
//   // return next();

//   const method = req.method.toLowerCase();
//   if (method == "options") {
//     return next();
//   }
//   // check header or url parameters or post parameters for token
//   let token =
//     req.body.token || req.query.token || req.headers["x-access-token"];

//   console.log({ token });

//   if (isDef(token)) {
//     try {
//       console.log("inside bro");

//       // verifies secret and checks exp
//       let decoded = jwt.verify(token, config.jwtSecret);
//       console.log("decoded");
//       console.log(decoded);
//       // if everything is good, save to request for use in other routes
//       (req as any).decoded = decoded;

//       const incomingPathName: string = url.parse(req.url).pathname!;
//       let resource = alterResource(incomingPathName);
//       console.log("resource:", resource);
//       console.log("method: ", method);

//       // Exception for API Admin User
//       if ((req as any).decoded.role == "bd_admin") {
//         return next();
//       }

//       let allowed = await acl.areAnyRolesAllowed(
//         (req as any).decoded.role,
//         resource,
//         method
//       );
//       console.log({ allowed });
//       if (allowed) {
//         console.log("Authorization passed");
//         return next();
//       } else {
//         throw Boom.unauthorized("Not authorized");
//       }
//     } catch (error: any) {
//       let resp;
//       console.log("error");
//       console.log(error.name);
//       if (error.name == "JsonWebTokenError" || "TokenExpiredError") {
//         resp = errBuilder(Boom.unauthorized("Not authorized"));
//       } else {
//         resp = errBuilder(Boom.boomify(error));
//       }
//       return next(resp);
//     }
//   } else {
//     console.log("in error");
//     // if there is no token return an error
//     const resp = errBuilder(
//       Boom.unauthorized("Please provide the access token")
//     );
//     return next(resp);
//   }
// });

app.use("/api", apiRoutes);
// Error Handler
app.use((err, req, res, next) => {
  const final_error = errBuilder(err);
  console.log("final_error");
  console.log(final_error);
  return res.status(final_error.statusCode).send(final_error);
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("server listening to port:", port);
});
