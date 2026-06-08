import app from "./src/app.js";
import connecttoDB from "./src/db/db.js";

connecttoDB();

app.listen(3000, () => {
  console.log("server is running on 3000");
});
