import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import {addComment, addPost, deletePost, editPost, getPost, getPosts, getVotesForPost, vote} from "../fake-db";
import {getUserById, getUsernameById} from "../controller/userController";
import {userInfo} from "node:os";
import {resolve} from "node:dns";

router.get("/", async (req, res) => {
  const posts = await getPosts(20);
  const user = await req.user;

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
  res.render("posts", { posts, user });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts");
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  if(req.user && req.user.id){
    if(!(req.body.title || req.body.link || req.body.description || req.body.subgroup)){
      console.error("Missing input")
      res.redirect("/posts/create")
    }
    else{
      const post = addPost(req.body.title, req.body.link, req.user.id, req.body.description, req.body.subgroup)
      res.redirect(`/posts/show/${post.id}`)
    }
  }
  else{
    console.error("User not found.")
    res.redirect("/auth/login")
  }
});

router.get("/show/:postid", async (req, res) => {
  const post = getPost(Number(req.params.postid))
  const authenticated = req.isAuthenticated();
  const user = req.user;
  const postVotes = getVotesForPost(Number(req.params.postid));
  let score = 0;
  let voted;
  postVotes.forEach((vote) => {
    score = score + vote.value;
    if(req.user && vote.post_id === Number(req.params.postid) && vote.user_id === req.user.id){
      voted = vote.value;
    }
  })
  res.render("individualPost", {post, authenticated, user, score, voted});
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  const post = getPost(Number(req.params.postid))
  res.render("editPost", {post})
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  editPost(req.body.id, {title: req.body.title, link: req.body.link, description: req.body.description, subgroup: req.body.subgroup});
  res.redirect(`/posts/show/${req.body.id}`)
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  const user = req.user;
  const post = getPost(Number(req.params.postid))
  if(user && user.id === post.creator.id ){
    res.render("confirmDelete", {post})
  }
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  deletePost(req.body.id);
  res.redirect(`/subs/show/${req.body.subgroup}`)
});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    if(req.user){
      addComment(Number(req.params.postid), req.user.id, req.body.commentContent);
      res.redirect(`/posts/show/${req.params.postid}`)
    }
    else{
      res.redirect("/auth/login")
    }
  }
);

router.post(
    "/vote/:postid",
    ensureAuthenticated,
    async (req, res) => {
      //the end goal is to have a counter of users who clicked + or -
      //Users should only be able to vote for either + or -
      // And it should only count once
      //save the voted users as an array? use .length to calculate the value of votes
      vote(Number(req.body.postID), Number(req.body.userID), Number(req.body.value));
      //this redirect causes a bit of an error, because if you vote on a post that's on the front page it will redirect you to the post which is def not optimal
      res.redirect(`/posts/show/${req.body.postID}`);
    }
)

export default router;
