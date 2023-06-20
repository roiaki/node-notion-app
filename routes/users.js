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
    return res.status(200).json(other);
  } catch(err) {
    return res.status(500).json();
  }
});

// ユーザーフォロー(フォローしたり外したりを繰り返す)
// :id フォローする相手のidのid
router.put("/:id/follow", async(req, res) => {
  // body:自分 req:フォローする相手が異なる場合
  if(req.body.userId !== req.params.id) {
    try {
      // フォローする相手
      const user = await User.findById(req.params.id);
      // Iam
      const currentUser = await User.findById(req.body.userId);
      
      // フォロワーに相手がいなかったらフォローできる
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
        return res.status(403).json("あなたは既にこのユーザーをフォローしています");
      }
    
    } catch(err) {
      return res.status(500).json();
    }
  } else {
    return res.status(500).json("自分をフォローできません");
  }
  
});

// ユーザーアンフォロー(フォローしたり外したりを繰り返す)
// :id フォローを外す相手のid
router.put("/:id/unfollow", async(req, res) => {
  // body:自分 req:フォローを外す相手が異なる場合
  if(req.body.userId !== req.params.id) {
    try {
      // フォローを外す相手
      const user = await User.findById(req.params.id);
      // Iam
      const currentUser = await User.findById(req.body.userId);
      
      // フォロワーに存在したらフォローを外せる
      if(user.followers.includes(req.body.userId)) {
        await user.updateOne({
          // 配列から取り除くpull
          $pull: {
            followers: req.body.userId, // 自分
          }
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          }
        });

        return res.status(200).json("フォローを外しました");

      } else {
        return res.status(403).json("このユーザーはフォロー解除できません");
      }
    
    } catch(err) {
      return res.status(500).json();
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除できません");
  }
  
});


module.exports = router;