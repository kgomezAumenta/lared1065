const https = require('https');
https.get('https://www.youtube.com/embed/live_stream?channel=UCMJ_FUWKr7PyXfvY55BdGZg', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data.includes('LIVE_STREAM_OFFLINE'));
    console.log(data.substring(0, 100)); // preview
  });
});
