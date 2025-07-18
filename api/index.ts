import App from "../src/app";
import { VercelRequest, VercelResponse } from "@vercel/node";

let app: any | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize app if not already done
    if (!app) {
      app = await App();
      await app.ready();
    }

    // Handle the request
    await app
      .inject({
        method: req.method,
        url: req.url,
        headers: req.headers,
        payload: req.body,
      })
      .then((response: any) => {
        res.status(response.statusCode);

        // Set headers
        Object.keys(response.headers).forEach((key) => {
          res.setHeader(key, response.headers[key]);
        });

        // Send response
        if (response.headers["content-type"]?.includes("application/json")) {
          res.json(JSON.parse(response.body));
        } else {
          res.send(response.body);
        }
      });
  } catch (error) {
    // console.error('Vercel handler error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
