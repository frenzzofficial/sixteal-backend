//auth routes groups
import { RouteOptions } from "fastify";
import { errorHandler } from "./auth.errorHandler";
import { validateBody } from "./auth.bodyValidations";

import * as replySchemas from "./auth.replySchemas";
import * as validationSchemas from "./auth.validationSchemas";
import * as authControllers from "./auth.controllers";

//register routes
const signupRoute: RouteOptions = {
  method: "POST",
  url: "/signup",
  preHandler: validateBody(validationSchemas.signupSchema),
  handler: authControllers.signupRouteController,
  errorHandler: errorHandler,
  schema: replySchemas.signupReplySchema,
};

const verifyUserEmailRoute: RouteOptions = {
  method: "POST",
  url: "/verify-email",
  preHandler: validateBody(validationSchemas.emalOtpVerifySchema),
  handler: authControllers.verifyUserEmailRouteController,
  errorHandler: errorHandler,
  schema: replySchemas.verifyEmailReplySchema,
};

const signinRoute: RouteOptions = {
  method: "POST",
  url: "/signin",
  preHandler: validateBody(validationSchemas.signinSchema),
  handler: authControllers.signinRouteController,
  errorHandler: errorHandler,
  schema: replySchemas.signinReplySchema,
};

//signout route
const signoutRoute: RouteOptions = {
  method: "POST",
  url: "/signout",
  handler: authControllers.signoutRouteController,
  errorHandler: errorHandler,
};

const userProfileRoute: RouteOptions = {
  method: "GET",
  url: "/me",
  handler: authControllers.userProfileRouteController,
  errorHandler: errorHandler,
};

const authRoutesGroup: RouteOptions[] = [
  signupRoute,
  signinRoute,
  signoutRoute,
  userProfileRoute,
  verifyUserEmailRoute,
];

export default authRoutesGroup;
