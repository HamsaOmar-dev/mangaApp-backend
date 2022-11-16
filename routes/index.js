const router = require("express").Router();
const prisma = require("../prisma.js");

router.get("/", async (req, res) => {
  await prisma.manga
    .findMany()
    .then((data) => {
      res.json(data);
      console.log("Manga Data sent from DB");
    })
    .catch((err) => console.log(err));
});

router.delete("/", async (req, res) => {
  await prisma.chapter
    .deleteMany()
    .then(async () => {
      await prisma.manga
        .deleteMany()
        .then(() => {
          console.log("All Mangas and Chapters have been Deleted");
          res.json("All Mangas and Chapters have been Deleted");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

module.exports = router;
