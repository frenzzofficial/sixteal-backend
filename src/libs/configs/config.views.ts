import path from "path";

export const viewConfig = {
  root: path.resolve(process.cwd(), "public"), // point directly to `view` folder
  prefix: "/view/", // optional: serve files with `/view/Home.html`
};

export const Home = "/view/Home.html";
