const { Cluster } = require("puppeteer-cluster");

const channelAverageInteraction = async (recentUploadURLs, {low, mid, high}) => {
  //========================================
  //Utility Functions
  //========================================
  const wholeNumAvg = (arrayOfNumbers) => {
    const integers = arrayOfNumbers.map((num) => parseInt(num));
    const average = integers.reduce((a, b) => a + b, 0) / integers.length;
    const AvgWholeNum = Math.round(average);
    return AvgWholeNum;
  };

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
  //Recent Uploads Data Puppeteer Cluster
  //========================================
  const cluster = await Cluster.launch({
    puppeteerOptions: { args: ['--no-sandbox'] },
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.setViewport({ height: 1920, width: 1080, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0" });
    const recentUploadStats = await page.evaluate(() => {
      //channel name
      const channelName = document.querySelector("#text-container").innerText;
      //video title
      const videoTitle = document.querySelector(
        'h1[class="title style-scope ytd-video-primary-info-renderer"]'
      ).innerText;

      //views
      const viewCount = document.querySelector(
        'span[class="view-count style-scope yt-view-count-renderer"]'
      ).innerText;

      //likes and dislikes
      const recentUploadLikeDislikeNodes = document.querySelectorAll(
        'a[class="yt-simple-endpoint style-scope ytd-toggle-button-renderer"]'
      );
      const list = [].slice.call(recentUploadLikeDislikeNodes);
      const likesDislikes = list.map((count) => count.innerText);

      //number of comments
      const commentCount = document.querySelector(".count-text").innerText;

      return {
        channelName,
        videoTitle,
        viewCount: viewCount.split(" ")[0],
        likes: likesDislikes[0],
        dislikes: likesDislikes[1],
        commentCount: commentCount.split(" ")[0],
      };
    });
    return recentUploadStats;
  });

  const recentUploadsStats = Promise.all(
    recentUploadURLs.map(async (vid) => {
      try {
        const result = await cluster.execute(vid);
        console.log(`[SuitBoiBot] ✔️ ${vid}`);
        return result;
      } catch (err) {
        console.log(`[SuitBoiBot] ❌ ${vid}`);
        // console.log(err);
        return `error scraping ${vid}`;
      }
    })
  );

  await cluster.idle();
  await cluster.close();

  const filteredRecentUploadStats = (await recentUploadsStats).filter(
    (videoStatObj) => typeof videoStatObj === "object"
  );

  const roundedRecentUploadsStats = await filteredRecentUploadStats.map(
    (upload) => {
      upload.channelName = upload.channelName;
      upload.viewCount = upload.viewCount.replace(/,/g, '');
      upload.likes = convertNumber(upload.likes.replace(/,/g, ''));
      upload.dislikes = convertNumber(upload.dislikes.replace(/,/g, ''));
      upload.commentCount = convertNumber(upload.commentCount.replace(/,/g, ''));
      return upload;
    }
  );

  const perUploadAveragesCalculator = (roundedRecentUploadsStats) => {
    const {
      channelName,
      viewCounts,
      likeCounts,
      dislikeCounts,
      commentCounts,
    } = roundedRecentUploadsStats.reduce(
      (acc, { channelName, viewCount, likes, dislikes, commentCount }) => ({
        ...acc,
        channelName: channelName,
        viewCounts: [...acc.viewCounts, viewCount],
        likeCounts: [...acc.likeCounts, likes],
        dislikeCounts: [...acc.dislikeCounts, dislikes],
        commentCounts: [...acc.commentCounts, commentCount],
      }),
      { channelName: '', viewCounts: [], likeCounts: [], dislikeCounts: [], commentCounts: [] }
    );

    const sumActions = (wholeNumAvg(likeCounts) + wholeNumAvg(dislikeCounts) + wholeNumAvg(commentCounts))/wholeNumAvg(viewCounts)

    const averageActionRate = `${(100*sumActions).toFixed(1)}%`

    return {
      channelName: channelName,
      views: wholeNumAvg(viewCounts),
      averageActionRate: averageActionRate,
      actions: {
        likesCount: wholeNumAvg(likeCounts),
        dislikesCount: wholeNumAvg(dislikeCounts),
        commentCount: wholeNumAvg(commentCounts),
      },
      estimatedCost: {
        low: `$${(wholeNumAvg(viewCounts)*low).toFixed(2)}`,
        mid: `$${(wholeNumAvg(viewCounts)*mid).toFixed(2)}`,
        high: `$${(wholeNumAvg(viewCounts)*high).toFixed(2)}`
      },
      videosScraped: `${filteredRecentUploadStats.length} out of last ${recentUploadURLs.length}`
    };
  };
  return perUploadAveragesCalculator(roundedRecentUploadsStats)
};

module.exports = channelAverageInteraction;