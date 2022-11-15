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

      for (let k = 0; k < data.length; k++) {
        await page
          .goto(data[k].link, {
            waitUntil: "networkidle0",
          })
          .then()
          .catch((err) => console.log(err));

        await page
          .evaluate(async () => {
            const chapterDataList = [];
            const chapterLength = document.querySelectorAll(
              "#chapterlist > ul > li"
            ).length;

            for (let l = 1; l <= chapterLength; l++) {
              const number = document.querySelector(
                "#chapterlist > ul > li:nth-child(" +
                  l +
                  ") > div > div > a > span.chapternum"
              )?.textContent;
              const date = document.querySelector(
                "#chapterlist > ul > li:nth-child(" +
                  l +
                  ") > div > div > a > span.chapterdate"
              )?.textContent;

              const link = document.querySelector(
                "#chapterlist > ul > li:nth-child(" + l + ") > div > div > a"
              ).href;

              const chapterInfo = {
                number: number,
                date: date,
                link: link,
              };
              chapterDataList.push(chapterInfo);
            }

            return chapterDataList;
          })
          .then(async (finalData) => {
            const fullMangaData = {
              title: data[k].title,
              link: data[k].link,
              image: data[k].image,
              latestChapters: data[k].latestChapters,
              chapters: JSON.stringify(finalData),
            };

            await prisma.manga
              .upsert({
                where: { title: fullMangaData.title },
                update: fullMangaData,
                create: fullMangaData,
              })
              .then((res) => console.log(res))
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
      console.log("Finished Scraping Asura");
    })
    .catch((err) => console.log(err));
  await browser.close();
}

scrapeAsura();
