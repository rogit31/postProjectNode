import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import {addComment, getPost, getPosts} from "../fake-db";
import {getUserById, getUsernameById} from "../controller/userController";

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
  // ⭐ TODO
});

router.get("/show/:postid", async (req, res) => {
  const post = getPost(Number(req.params.postid))
  const authenticated = req.isAuthenticated();
  res.render("individualPost", {post, authenticated});
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    // ⭐ TODO
  }
);

export default router;
