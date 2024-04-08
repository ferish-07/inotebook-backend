const connectToMongo = require("./dB");
const express = require("express");
const cors = require("cors");
const app = express();

connectToMongo();
const port = 4000;
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
// app.get("/", (req, res) => {
//   res.send("Hello Harry!");
// });
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
