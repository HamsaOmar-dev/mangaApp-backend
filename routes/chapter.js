const router = require("express").Router();
const prisma = require("../prisma.js");

router.get("/chapter/:chapterLink", async (req, res) => {
  const chapterLink = req.params.chapterLink;

  await prisma.chapter
    .findUnique({
      where: {
        link: chapterLink,
      },
    })
    .then(async (data) => {
      res.json(data);
      console.log("Chapter sent from DB");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
