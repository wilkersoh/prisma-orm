// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { body, validationResult } = require("express-validator"); // midleware
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const userValidationRules = [
  // validate email first
  body("email")
    .isLength({ min: 1 })
    .withMessage("Email must not be empty")
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("name").isLength({ min: 1 }).withMessage("Name must not be empty"),
  body("role")
    .isIn(["ADMIN", "USER", "SUPERADMIN", undefined])
    .withMessage(`Role must be one of 'ADMIN', 'USER', 'SUPERADMIN'`),
];

const checkForErrors = (req, res, next) => {
  const errors = simpleValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  next();
};

const simpleValidationResult = validationResult.withDefaults({
  formatter: (err) => err.msg, // only return msg error of the object
});

// Craete
app.post("/users", userValidationRules, checkForErrors, async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
      },
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
// Read
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        uuid: true,
        name: true,
        role: true,
        // Post: true, // get relation posts from the user; "Post" name came from schema.prisma
        Post: {
          select: {
            body: true,
            title: true,
          }
        }
      },
    });

    return res.json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
// Update
app.put(
  "/users/:uuid",
  userValidationRules,
  checkForErrors,
  async (req, res) => {
    const { name, email, role } = req.body;
    const uuid = req.params.uuid;
    try {
      let user = await prisma.user.findUnique({ where: { uuid } });

      user = await prisma.user.update({
        where: { uuid },
        data: { name, email, role },
      });

      return res.json(user);
    } catch (error) {
      return res.status(404).json(error);
    }
  }
);
// Delete
app.delete("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    await prisma.user.delete({ where: { uuid } });

    return res.json({ message: "User deleted" });
  } catch (error) {
    return res.status(404).json({ error: "Something went wrong" });
  }
});
// Find
app.get("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const user = await prisma.user.findUnique({ where: { uuid } });

    return res.json(user);
  } catch (error) {
    return res.status(404).json({ error: "User not found" });
  }
});

const postValidationRules = [
  body("title").isLength({ min: 1 }).withMessage("Title must not be empty"),
];

// Create a post
app.post("/posts", postValidationRules, checkForErrors, async (req, res) => {
  const { title, body, userUuid } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        body,
        user: { connect: { uuid: userUuid } },
      },
    });

    return res.json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});
// Read all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true }, // return the relationship user data
    });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server runing at port 5000"));
