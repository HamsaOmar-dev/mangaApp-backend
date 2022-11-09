const router = require("express").Router();
const prisma = require("../prisma.js");

router.get("/", async (req, res) => {
  await prisma.manga
    .findMany()
    .then((data) => {
      res.json(data.reverse());
      console.log("Manga Data sent from DB");
    })
    .catch((err) => console.log(err));
});

router.delete("/", async (req, res) => {
  await prisma.manga
    .deleteMany()
    .then(() => {
      console.log("All Mangas have been Deleted");
    })
    .catch((err) => console.log(err));

  await prisma.chapter
    .deleteMany()
    .then(() => {
      res.json("All Chapters have been Deleted");
      console.log("All Chapters have been Deleted");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
