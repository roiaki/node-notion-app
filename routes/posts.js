const router = require("express").Router();

const Post = require("../models/Post");
const User = require("../models/User");


// 投稿を作成する
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
    
  } catch(err) {
    return res.status(500).json(err);
  }

});

// 投稿を更新
router.put("/:id", async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿を更新しました");

    } else {
      return res.status(403).json("あなたは他人の投稿を編集できません");
    }
  }catch(err) {
    return res.status(403).json(err);
  }
});

// 投稿を削除する
router.delete("/:id", async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿を削除しました");

    } else {
      return res.status(403).json("あなたは他人の投稿を削除できません");
    }
  }catch(err) {
    return res.status(403).json(err);
  }
});

// 投稿を取得する
router.get("/:id", async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch(err) {
    return res.status(403).json(err);
  }
});


// 特定の投稿にいいねを押す
// ユーザーフォロー(フォローしたり外したりを繰り返す)
// :id フォローする相手のid
router.put("/:id/like", async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // まだ投稿にいいねを押していなかったら
    if(!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {
          likes: req.body.userId, // likesに自分のIdを入れる
        }
      });
      return res.status(200).json("投稿にいいねを押した");
    // すでに投稿にいいねが押されていらら
    } else {
      // いいねしているIdを除く
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("投稿からいいねを外した");
    }
  
  } catch(err) {
    return res.status(500).json();
  }
});

// タイムラインの投稿の取得（フォローしているユーザーと自分の投稿）
router.get("/timeline/:userId", async(req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    // console.log(currentUser);
    const userPosts   = await Post.find({ userId: currentUser._id });
    
    // arr = [1, 2, 3];
    // arr.map((x) => {return x + 2; }) 
    const friendPosts = await Promise.all(
      currentUser.followings.map((frindId) => {
        return Post.find({ userId: frindId });
      })
    );

    console.log(friendPosts);
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch(err) {
    return res.status(500).json(err);

  }
});

module.exports = router;