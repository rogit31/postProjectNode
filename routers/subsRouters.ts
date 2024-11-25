// const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../controller/postController";
import {getPost, getPosts, getSubs, getVotesForPost} from "../fake-db";
import {getUsernameById} from "../controller/userController";
const router = express.Router();


router.get("/list", async (req, res) => {
  let subs = getSubs();
  subs = subs.sort()
  res.render("subs", {subs});
});

router.get("/show/:subname", async (req, res) => {
  const posts = getPosts(10, req.params.subname);
  const user = req.user;
  for (let post of posts) {
    post.score = 0;
    const username = await getUsernameById(post.creator);
    const votes = getVotesForPost(post.id);
    votes.forEach((vote) => {
      if(post.id === vote.post_id){
        post.score = (post.score || 0 ) + vote.value;
      }
      if(user && vote.user_id === user.id && vote.post_id === post.id){
        post.voted = vote.value;
      }
    })
    if(username){
      post.creatorUsername = username;
    }
  }
  res.render("sub", {posts, user});
});

export default router;
