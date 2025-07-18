import type { RouteOptions } from "fastify";
import * as errHandler from "./test.errors";
import * as Schema from "./test.schemas";
import * as authControllers from "./test.controllers";

const testRoute: RouteOptions = {
  method: "GET",
  url: "/test",
  handler: authControllers.getTestRoute,
  errorHandler: errHandler.getTestErrorHandler,
  schema: Schema.getTestSchema,
};

const testRoutesGroup = [testRoute];

export default testRoutesGroup;
