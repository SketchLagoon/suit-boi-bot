const puppeteer = require("puppeteer");

const channelData = async (channelURL) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ height: 1920, width: 1080, deviceScaleFactor: 1 });
  await page.goto(channelURL, { waitUntil: "networkidle0" });

  //========================================
  //Utility Functions
  //========================================
  const wholeNumAvg = arrayOfNumbers =>{
    const integers = arrayOfNumbers.map(num=>parseInt(num))
    const average = integers.reduce((a, b) => a + b, 0) / integers.length;
    const AvgWholeNum = Math.round(average);
    return AvgWholeNum
  }

    const convertNumber = (abbrevNum) => {
    if (abbrevNum[abbrevNum.length - 1] === "M") {
      const numNoLabel = abbrevNum.replace("M", "");
      return numNoLabel * 1000000;
    } else if (abbrevNum[abbrevNum.length - 1] === "K") {
      const numNoLabel = abbrevNum.replace("K", "");
      return numNoLabel * 1000;
    } else if (parseInt(abbrevNum[abbrevNum.length - 1]) != NaN) {
      return parseInt(abbrevNum);
    }
  };

  //========================================
  //BASIC CHANNEL INFORMATION (NAME, PROFILE IMAGE, HEADER IMAGE, SUBSCRIBERS)
  //========================================
  const basicChannelInfo = await page.evaluate(() => {
    const channelName = document.querySelector("#text-container").innerText;

    const channelSubCount = document.querySelector("#subscriber-count")
      .innerText;

    const profileImageURL = document.querySelector("#img").src;

    const headerImageNode = document.querySelector("#backgroundFrontLayer");
    const headerImageStyleValue = getComputedStyle(headerImageNode)[
      "background-image"
    ];
    const headerImageURL = headerImageStyleValue
      .toString()
      .match(/"([^"]+)"/)[1];

    const recentUploadThumbnailNodes = document.querySelectorAll('a[id="thumbnail"]');
    const list = [].slice.call(recentUploadThumbnailNodes);
    const untrimmedRecentUploadURLs = list.map((url) => url.href);
    // removes last index of the links array 
    // in this case, a blank string is removed
    // popped will hold the blank string
    const popped = untrimmedRecentUploadURLs.pop();

    const recentUploadURLs = untrimmedRecentUploadURLs.slice(0,30)

    return {
      channelName,
      channelSubCount,
      profileImageURL,
      headerImageURL,
      recentUploadURLs,
    };
  });


  //========================================
  //SHAPING RETURN OBJECT
  //========================================
  const youtubeChannelData = {
    channelName: basicChannelInfo.channelName,
    channelSubCount: basicChannelInfo.channelSubCount,
    profileImageURL: basicChannelInfo.profileImageURL,
    headerImageURL: basicChannelInfo.headerImageURL,
    recentUploadURLs: basicChannelInfo.recentUploadURLs,
    // perUploadAverages: perUploadAveragesCalculator(roundedRecentUploadsStats),
    // recentUploadsStats: roundedRecentUploadsStats,
  }

  await browser.close();
  return youtubeChannelData
};

module.exports = channelData;