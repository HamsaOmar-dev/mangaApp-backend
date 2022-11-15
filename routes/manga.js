const router = require("express").Router();
const prisma = require("../prisma.js");

router.get("/:mangaTitle", async (req, res) => {
  const mangaTitle = req.params.mangaTitle;

  await prisma.manga
    .findUnique({
      where: {
        title: mangaTitle,
      },
    })
    .then(async (data) => {
      res.json(data);
      console.log("manga sent from DB");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
