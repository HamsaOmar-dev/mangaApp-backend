const prisma = require("../prisma.js");
const puppeteer = require("puppeteer");

async function scrapeAsura() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page
    .goto("https://asura.gg/", {
      waitUntil: "networkidle0",
    })
    .then(() => console.log("Manga Page Loaded"))
    .catch((err) => console.log(err));

  await page
    .evaluate(async () => {
      const dataList = [];
      for (let i = 1; i < 14; i++) {
        const title = document.querySelector(
          "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
            i +
            ") > div > div.luf > a"
        )?.title;
        const link = document.querySelector(
          "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
            i +
            ") > div > div.luf > a"
        )?.href;
        const image = document.querySelector(
          "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
            i +
            ") > div > div.imgu > a > img"
        )?.src;

        const latestChapters = [];

        for (let j = 1; j < 4; j++) {
          const latestChaptersData = {
            chapter: document.querySelector(
              "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
                i +
                ") > div > div.luf > ul > li:nth-child(" +
                j +
                ") > a"
            )?.textContent,
            time: document.querySelector(
              "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
                i +
                ") > div > div.luf > ul > li:nth-child(" +
                j +
                ") > span"
            )?.textContent,
            link: document.querySelector(
              "#content > div > div.postbody > div > div.listupd > div:nth-child(" +
                i +
                ") > div > div.luf > ul > li:nth-child(" +
                j +
                ") > a"
            )?.href,
          };
          latestChapters.push(latestChaptersData);
        }

        const mangaData = {
          title: title,
          link: link,
          image: image,
          latestChapters: JSON.stringify(latestChapters),
        };
        {
          mangaData.title ? dataList.push(mangaData) : null;
        }
      }
      return dataList;
    })
    .then(async (data) => {
      await prisma.manga
        .deleteMany()
        .then(() => {
          console.log("All Mangas have been Deleted");
        })
        .catch((err) => console.log(err));
      data.reverse().forEach(async (mangaData, index) => {
        await prisma.manga
          .upsert({
            where: { title: mangaData.title },
            update: mangaData,
            create: mangaData,
          })
          .then(() => console.log("Saved Manga " + index + " Data"))
          .catch((err) => console.log(err));
      });
      console.log("Finished Scraping Asura");
    })
    .catch((err) => console.log(err));
  await browser.close();
}

scrapeAsura();
