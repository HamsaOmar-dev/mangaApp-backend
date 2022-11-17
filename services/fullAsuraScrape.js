const prisma = require("../prisma.js");
const puppeteer = require("puppeteer");

async function fullAsuraScrape() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  for (let h = 1; h < 9; h++) {
    await page
      .goto("https://asura.gg/manga/?page=" + h + "&order=update", {
        waitUntil: "networkidle0",
      })
      .then(() => console.log("Manga Page Loaded"))
      .catch((err) => console.log(err));

    await page
      .evaluate(async () => {
        const dataList = [];
        for (let i = 1; i < 21; i++) {
          const title = document
            .querySelector(
              "#content > div > div.postbody > div > div.mrgn > div.listupd > div:nth-child(" +
                i +
                ") > div > a > div.bigor > div.tt"
            )
            ?.textContent.slice(5, -3);
          const link = document.querySelector(
            "#content > div > div.postbody > div > div.mrgn > div.listupd > div:nth-child(" +
              i +
              ") > div > a"
          )?.href;
          const image = document.querySelector(
            "#content > div > div.postbody > div > div.mrgn > div.listupd > div:nth-child(" +
              i +
              ") > div > a > div.limit > img"
          )?.src;

          const mangaData = {
            title: title,
            link: link,
            image: image,
          };
          {
            mangaData.title ? dataList.push(mangaData) : null;
          }
        }
        return dataList;
      })
      .then(async (data) => {
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
        }
      })
      .catch((err) => console.log(err));
  }
  console.log("Finished Scraping Asura");
  await browser.close();
}

fullAsuraScrape();
