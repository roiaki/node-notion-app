const router = require("express").Router();
const User = require("../models/User");


// ユーザー情報更新
router.put("/:id", async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        // $set 全て
        $set: req.body,       
      });
      res.status(200).json("ユーザーを更新しました");
    } catch(err) {
      return res.status(500).json();
    }

  } else {
    return res.status(403).json("異なるユーザーです");
  }
});

// ユーザー情報削除
router.delete("/:id", async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id, {
        // $set 全て
        $set: req.body,       
      });
      res.status(200).json("ユーザーを削除しました");
    } catch(err) {
      return res.status(500).json();
    }

  } else {
    return res.status(403).json("異なるユーザーです");
  }
});

// ユーザー情報取得
router.get("/:id", async(req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // user._docにuserの全てのデータがある
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch(err) {
    return res.status(500).json();
  }
});

// ユーザーフォロー(フォローしたり外したりを繰り返す)
router.put("/:id/follow", async(req, res) => {
  if(req.user.userId !== req.params.id) {
    try {
      // フォローする相手
      const user = await User.findById(req.params.id);
      // Iam
      const currentUser = await User.findById(req.body.userId);
      
      // フォロワーに自分がいなかったらフォローできる
      if(!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId, // 自分
          }
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          }
        });
        
        return res.status(200).json("フォローしました");

      } else {
        return res
          .status(403)
          .json("あなたは既にこのユーザーをフォローしています");
      }
    
    } catch(err) {
      return res.status(500).json();
    }
  } else {
    return res.status(500).json("自分をフォローできません");
  }
  
});


module.exports = router;