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

const authRoutesGroup: RouteOptions[] = [signupRoute, verifyUserEmailRoute];

export default authRoutesGroup;
