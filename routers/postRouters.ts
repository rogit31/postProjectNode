import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import {addComment, addPost, deletePost, editPost, getPost, getPosts} from "../fake-db";
import {getUserById, getUsernameById} from "../controller/userController";
import {userInfo} from "node:os";

router.get("/", async (req, res) => {
  const posts = await getPosts(20);
  const user = await req.user;

  for (let post of posts) {
  const username = await getUsernameById(post.creator);
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
  res.render("individualPost", {post, authenticated, user});
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

export default router;
