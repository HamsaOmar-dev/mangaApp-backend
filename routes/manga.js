const router = require("express").Router();
const prisma = require("../prisma.js");

router.get("/manga/:mangaTitle", async (req, res) => {
  const mangaTitle = req.params.mangaTitle;

  await prisma.manga
    .findUnique({
      where: {
        title: mangaTitle,
      },
      include: {
        chapters: true
      }
    })
    .then(async (data) => {
      res.json(data);
      console.log("Manga sent from DB");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
