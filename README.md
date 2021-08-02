https://www.youtube.com/watch?v=Ehv69qFvN2I&t=168s


# How to start
> npm run dev

1. enter prisma database from terminal
2. enter the database
3. copy base.sql code without drop database
4. paste base.sql to create table
5. back to vscode terminal run npx prisma introspect to generate the prisma model in schema.prisma


# Note
1. Middleware of express

```javascript
const { body, validationResult } = require("express-validator");

app.post("/users", [
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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }

  // pass middleware, do your logics

})


```
