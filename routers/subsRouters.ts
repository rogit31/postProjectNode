// const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../controller/postController";
import {getPost, getPosts, getSubs} from "../fake-db";
const router = express.Router();


router.get("/list", async (req, res) => {
  let subs = getSubs();
  subs = subs.sort()
  res.render("subs", {subs});
});

router.get("/show/:subname", async (req, res) => {
  const posts = getPosts(10, req.params.subname)
  res.render("sub", {posts});
});

export default router;
