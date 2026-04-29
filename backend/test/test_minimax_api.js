import fetch from 'node-fetch';

const API_KEY = 'your_api_key_here';
const API_URL = 'https://apix.namoq.com/v1/chat/completions';

const testMessage = 'Hello, this is a test message.';

async function testMiniMaxAPI() {
  console.log('Testing MiniMax API connectivity...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7-highspeed',
        messages: [
          {
            role: 'user',
            content: testMessage
          }
        ]
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    const data = await response.json();

    console.log('\nResponse:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ API connectivity test PASSED!');
    } else {
      console.log('\n❌ API connectivity test FAILED!');
      console.log(`Error: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
  }
}

testMiniMaxAPI();
