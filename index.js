import fs from 'node:fs';
import ora from 'ora';
import axios from 'axios';
import { setInterval } from 'node:timers/promises';
const getAccToken = async (query) => {
  try {
    const s = await axios.post(
      'https://api.tapswap.ai/api/account/login',
      {
        init_data: query,
        referrer: '',
        bot_key: 'app_bot_0',
      },
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Build/RQ3A.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36',
          'Content-Type': 'application/json',
          'sec-ch-ua':
            '"Not_A Brand";v="8", "Chromium";v="120", "Android WebView";v="120"',
          'x-app': 'tapswap_server',
          'sec-ch-ua-mobile': '?1',
          'x-cv': '1',
          'sec-ch-ua-platform': '"Android"',
          Origin: 'https://app.tapswap.club',
          'X-Requested-With': 'org.telegram.messenger',
          'Sec-Fetch-Site': 'cross-site',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          Referer: 'https://app.tapswap.club/',
          'Accept-Language': 'en,en-US;q=0.9',
        },
      }
    );
    const data = await s.data;
    return data;
  } catch (error) {
    throw error;
  }
};
const padNumber = (num, length) => {
  return num.toString().padStart(length, '0');
};
const clicks = async (token, clickAmount, playerid) => {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts <= maxAttempts) {
    try {
      const now = Date.now();
      let contentid = now * playerid;
      contentid = contentid * playerid;
      contentid = contentid / playerid;
      contentid = contentid % playerid;
      contentid = contentid % playerid;
      const { data } = await axios.post(
        'https://api.tapswap.ai/api/player/submit_taps',
        {
          taps: clickAmount,
          time: now,
        },
        {
          // fixed at https://github.com/Poryaei/TapSwap-Clicker/blob/main/tapswap.py
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Build/RQ3A.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'sec-ch-ua':
              '"Not_A Brand";v="8", "Chromium";v="120", "Android WebView";v="120"',
            'sec-ch-ua-mobile': '?1',
            Authorization: `Bearer ${token}`,
            'x-cv': '1',
            'x-app': 'tapswap_server',
            'sec-ch-ua-platform': '"Android"',
            Origin: 'https://app.tapswap.club',
            'X-Requested-With': 'org.telegram.messenger',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://app.tapswap.club/',
            'Accept-Language': 'en,en-US;q=0.9',
            'Content-Id': contentid.toString(),
          },
        }
      );
      // const data = await r.json();
      return data;
    } catch (error) {
      attempts += 1;
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.log(`failed when try click at attemps ${attempts}, retrying...`);
    }
  }
};
const boost = async (token, type) => {
  try {
    const { data } = await axios.post(
      'https://api.tapswap.ai/api/player/apply_boost',
      JSON.stringify({
        type: type == 'energy' ? 'energy' : 'turbo',
      }),
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Build/RQ3A.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36',
          'Content-Type': 'application/json',
          'sec-ch-ua':
            '"Not_A Brand";v="8", "Chromium";v="120", "Android WebView";v="120"',
          'sec-ch-ua-mobile': '?1',
          Authorization: `Bearer ${token}`,
          'x-cv': '1',
          'x-app': 'tapswap_server',
          'Content-Id': '195676',
          'sec-ch-ua-platform': '"Android"',
          Origin: 'https://app.tapswap.club',
          'X-Requested-With': 'org.telegram.messenger',
          'Sec-Fetch-Site': 'cross-site',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          Referer: 'https://app.tapswap.club/',
          'Accept-Language': 'en,en-US;q=0.9',
        },
      }
    );
    if (type == 'energy') {
      console.log(`Succes claim energy refill`);
    } else {
      console.log(`Succes claim turbo guru boost`);
      console.log(data.player.boost[1]);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
(async () => {
  try {
    while (true) {
      process.stdout.write('\x1Bc');
      const reqTxt = fs.readFileSync('req.txt', 'utf-8').replace(/\r/g, '');
      const arrAcc = reqTxt.split('\n');
      // return console.log(arrAcc);
      for (const acc of arrAcc) {
        const init_data = acc.split(' ')[0];
        const accInfo = await getAccToken(init_data);
        const { access_token, player } = accInfo;

        console.log(`Login as ${player.full_name}`);

        let energyRefill = player.boost[0].cnt;
        const playerid = player.id;
        while (energyRefill >= 0) {
          energyRefill = player.boost[0];
          let energy = player.energy;
          let tapLevel = player.tap_level;

          let doClick;
          while (energy >= tapLevel) {
            const maxClicks = Math.min(150, Math.floor(energy / tapLevel));
            const clickAmount = Math.floor(Math.random() * maxClicks) + 1;
            // const time = Date.now();
            doClick = await clicks(access_token, clickAmount, playerid);
            energy = doClick.player.energy;
            const json = {
              click: padNumber(clickAmount, 3),
              energy: padNumber(energy, 7),
              shares: doClick.player.stat.taps.toString(),
            };
            console.log(json);
          }
          if (
            doClick.player.boost[1].cnt >= 1 &&
            doClick.player.boost.end == 0
          ) {
            console.log(`Have tapping guru, start using this`);
            await boost(access_token, 'turbo');
            energy = tapLevel;
            energyRefill = doClick.player.boost[1].cnt;
            continue;
          } else {
            if (doClick.player.boost[0].cnt >= 1) {
              console.log(`Claiming energy refill`);
              await boost(access_token, 'energy');
              energyRefill = doClick.player.boost[1].cnt;
            } else {
              console.log(`No energy `);
              break;
            }
          }
        }
        console.log(`process done ${player.full_name} \n`);
      }
      const delayInSeconds = 300;
      let remainingSeconds = delayInSeconds;

      const spinner = ora(`Delaying ${remainingSeconds} second`).start();
      const interval = 1000;
      for await (const startTime of setInterval(interval, Date.now())) {
        remainingSeconds -= 1;
        spinner.text = `Delaying ${remainingSeconds} second`;
        if (remainingSeconds <= 0) {
          clearInterval(interval);
          spinner.succeed('done');
          break;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
