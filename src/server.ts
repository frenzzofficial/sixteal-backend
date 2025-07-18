import App from "../src/app";
import { envAppConfig } from "../src/libs/configs/config.env";

//Config Server Port to be use, so make sure setup SERVER_PORT in env file
if (!envAppConfig.APP_PORT) {
  process.exit(1);
}

//Setup API path for the safety of the api
if (!envAppConfig.APP_API_PATH) {
  process.exit(1);
}

// start server
const startserver = async () => {
  try {
    const PORT: number = envAppConfig.APP_PORT;
    const app = await App();
    await new Promise((resolve, reject) => {
      app.listen({ port: PORT }, () => {
        if (envAppConfig.APP_ENV === "development") {
          console.log(`Server running on http://localhost:${PORT}`);
          console.log(
            `📚 API Documentation available at http://localhost:${PORT}/documentation`
          );
        }
        resolve("server started");
        reject("server failed");
      });
    });
  } catch (err) {
    console.error("Server can not start: ", err);
    process.exit(1);
  }
};

startserver();
