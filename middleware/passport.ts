import passport from "passport";
import {IVerifyOptions, Strategy as LocalStrategy} from "passport-local";
import {
  getUserByEmailIdAndPassword,
  getUserById,
} from "../controller/userController";
import {TUsers} from "../types";

declare global {
    namespace Express{
        interface User{
            id: number
        }
    }
}

const localLogin = new LocalStrategy(
  {
    usernameField: "uname",
    passwordField: "password",
  },
    //the done type is really long but this is it!
  async (uname: string, password: string, done: (error: {message: string} | null, user?: (false | Express.User | undefined), options?: (IVerifyOptions | undefined)) => void) => {
    // Check if user exists in database
    const user = await getUserByEmailIdAndPassword(uname, password);
    return user
      ? done(null, user)
      : done(null, false, {
          message: "Your login details are not valid. Please try again.",
        });
  }
);


passport.serializeUser(function (user: Express.User, done: (err: any, id?: number) => void) {
  done(null, user.id);
});

passport.deserializeUser(async function (id: number, done:  (err: {message: string} | null, user?: (false | Express.User | null | undefined)) => void) {
    const user = await getUserById(id);
    if (user) {
        done(null, user);
    } else {
        done({message: "User not found"}, null);
    }
});

export default passport.use(localLogin);
