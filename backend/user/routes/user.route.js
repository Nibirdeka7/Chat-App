import { Router } from "express";
import { getAllUsers, getAUser, loginUser, myProfile, updateName, verifyUser } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/profile", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getAUser);
router.post("/update/user", isAuth, updateName);


export default router;