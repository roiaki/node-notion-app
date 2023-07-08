const express =  require("express");
const app = express();
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const uploadRouter = require("./routes/upload");

const PORT = 5000;
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

// DB接続
mongoose.connect(process.env.MONGOURL)
  .then(() => {
    console.log("DB接続中...");
  })
  .catch((err) => {
    console.log(err);
  });

// 使うデータはjson形式です
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());

// ミドルウエア /api/users をルートディレクトリ―に設定
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/upload", uploadRouter);


// "/"エンドポイント
app.get("/", (req, res) => {
  res.send("hello express");
});

app.get("/users", (req, res) => {
  res.send("users express");
});

// サーバーの構築　第1引数：ポート番号、第２引数：コールバック関数
var listener = app.listen(PORT, () => 
  console.log((listener.address().port + "：サーバーが起動しました")));