const getChannelData = require('./channelData');
const getAverageChannelPerformance = require('./averageChannelPerformance');

//'https://www.youtube.com/user/GazamoNetwork/videos'
const channelVideosURL = process.argv[2];

const getV30Data = async () => {
  const estimatedCostRange = {
    low: 0.1,
    mid: 0.2,
    high: 0.3
  };

  try {
    console.log('[SuitBoiBot] 🚀 Starting 0/2');
    const basicChannelData = await getChannelData(
      'https://www.youtube.com/user/GazamoNetwork/videos'
    );
    console.log('[SuitBoiBot] ☄️ Buckle Up! 1/2');
    const v30Data = await getAverageChannelPerformance(
      basicChannelData.recentUploadURLs,
      estimatedCostRange
    );
    console.log('[SuitBoiBot] 🌌 Finished 2/2');
    console.log(v30Data);
    process.exit();
    // return v30Data
  } catch (err) {
    console.log(`[SuitBoiBot] ☠️ Call Alex ☠️/2`);
    console.log(err);
    return `[SuitBoiBot] ☠️ Call Alex ☠️/2`;
  }
};

getV30Data();
