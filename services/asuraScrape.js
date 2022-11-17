const prisma = require("../prisma.js");
const puppeteer = require("puppeteer");

async function cronAsuraScrape() {
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
      for (let k = 0; k < data.length; k++) {
        await prisma.manga
          .findUnique({
            where: { title: data[k].title },
          })
          .then(async (res) => {
            await prisma.chapter
              .findUnique({
                where: {
                  routeLink: JSON.parse(data[k].latestChapters)[2].link.slice(
                    17,
                    -1
                  ),
                },
              })
              .then(async (chapterRes) => {
                await page
                  .goto(data[k].link, {
                    waitUntil: "networkidle0",
                  })
                  .then()
                  .catch((err) => console.log(err));

                if (res === null || chapterRes === null) {
                  console.log("Scraping Full Manga");
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
                          "#chapterlist > ul > li:nth-child(" +
                            l +
                            ") > div > div > a"
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
                      };

                      await prisma.manga
                        .create({
                          data: fullMangaData,
                        })
                        .then((res) => console.log(res))
                        .catch((err) => console.log(err));

                      finalData = finalData.reverse();

                      for (let l = 0; l < finalData.length; l++) {
                        await page
                          .goto(finalData[l].link, {
                            waitUntil: "networkidle0",
                          })
                          .then()
                          .catch((err) => console.log(err));

                        await page
                          .evaluate(async () => {
                            const images = Array.from(
                              document.querySelectorAll("#readerarea > p > img")
                            ).map((data) => data.src);
                            return images;
                          })
                          .then(async (imageData) => {
                            const finalChapterData = {
                              number: finalData[l].number,
                              date: finalData[l].date,
                              link: finalData[l].link,
                              routeLink: finalData[l].link.slice(17, -1),
                              images: JSON.stringify(imageData),
                              mangaTitle: data[k].title,
                            };
                            await prisma.chapter
                              .create({
                                data: finalChapterData,
                              })
                              .then((res) => console.log(res))
                              .catch((err) => console.log(err));
                          })
                          .catch((err) => console.log(err));
                      }
                    })
                    .catch((err) => console.log(err));
                } else {
                  console.log("Scraping Latest Chapters");
                  await page
                    .evaluate(async () => {
                      const chapterDataList = [];
                      const chapterLength = 2;

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
                          "#chapterlist > ul > li:nth-child(" +
                            l +
                            ") > div > div > a"
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

                      finalData = finalData.reverse();
                      
                      for (let l = 0; l < finalData.length; l++) {
                        await page
                          .goto(finalData[l].link, {
                            waitUntil: "networkidle0",
                          })
                          .then()
                          .catch((err) => console.log(err));

                        await page
                          .evaluate(async () => {
                            const images = Array.from(
                              document.querySelectorAll("#readerarea > p > img")
                            ).map((data) => data.src);
                            return images;
                          })
                          .then(async (imageData) => {
                            const finalChapterData = {
                              number: finalData[l].number,
                              date: finalData[l].date,
                              link: finalData[l].link,
                              routeLink: finalData[l].link.slice(17, -1),
                              images: JSON.stringify(imageData),
                              mangaTitle: data[k].title,
                            };
                            await prisma.chapter
                              .create({
                                data: finalChapterData,
                              })
                              .then((res) => console.log(res))
                              .catch((err) => console.log(err));
                          })
                          .catch((err) => console.log(err));
                      }
                    })
                    .catch((err) => console.log(err));
                }
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
  await browser.close();
}

cronAsuraScrape();
