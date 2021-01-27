const getChannelData = require('./channelData')
const getAverageChannelPerformance = require('./averageChannelPerformance')

//'https://www.youtube.com/c/Pestily/videos'
const channelVideosURL = process.argv[2]

const getV30Data = async () => {

  const estimatedCostRange = {
    low: 0.1,
    mid: 0.2,
    high: 0.3
  }

  try {
    console.log('[Suit Boi Bot] 🚀 Starting...')
    const basicChannelData = await getChannelData('https://www.youtube.com/c/Pestily/videos')
    const v30Data = await getAverageChannelPerformance(basicChannelData.recentUploadURLs, estimatedCostRange)
    console.log(v30Data)
    process.exit()
    // return v30Data
  } catch (err) {
    console.log(`[SuitBoiBot] ☠️ Call Alex`);
    console.log(err);
    console.log(`[SuitBoiBot] ☠️ Call Alex`);
    return `[SuitBoiBot] ☠️ Call Alex`;
  }
}


getV30Data()