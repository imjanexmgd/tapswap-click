import fs from 'node:fs';
import ora from 'ora';
import { setTimeout, setInterval } from 'node:timers/promises';
const getAccToken = async (query) => {
  try {
    const r = await fetch('https://api.tapswap.ai/api/account/login', {
      method: 'POST',
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
      body: JSON.stringify({
        init_data: query,
        referrer: '',
        bot_key: 'app_bot_1',
      }),
    });
    const data = await r.json();
    return data;
  } catch (error) {
    throw error;
  }
};
const click = async (token, clickAmount, date) => {
  try {
    const r = await fetch('https://api.tapswap.ai/api/player/submit_taps', {
      method: 'POST',
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
      body: JSON.stringify({
        taps: clickAmount,
        time: date,
      }),
    });
    const data = await r.json();
    // return
    return data;
  } catch (error) {
    throw error;
  }
};
const boost = async (token, type) => {
  try {
    const r = await fetch('https://api.tapswap.ai/api/player/apply_boost', {
      method: 'POST',
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
      },
      body: JSON.stringify({
        type: type == 'energy' ? 'energy' : 'turbo',
      }),
    });
    const data = await r.json();
    if (type == 'energy') {
      console.log(`Succes claim energy`);
    } else {
      console.log(`Succes claim turbo guru`);
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
      for (const acc of arrAcc) {
        const accInfo = await getAccToken(acc);
        const { access_token, player } = accInfo;

        console.log(`Login as ${player.full_name}`);

        let energyRefill = player.boost[0].cnt;
        while (energyRefill >= 0) {
          energyRefill = player.boost[0];
          let energy = player.energy;
          let tapLevel = player.tap_level;
          //   console.log(tapLevel);
          let doClick;
          while (energy >= tapLevel) {
            const maxClicks = Math.min(150, Math.floor(energy / tapLevel));
            const clickAmount = Math.floor(Math.random() * maxClicks) + 1;
            const time = Date.now();
            doClick = await click(access_token, clickAmount, time);
            energy = doClick.player.energy;
            console.log(
              `Current energy ${energy} current shares ${doClick.player.stat.taps} click ${clickAmount}`
            );
          }
          if (doClick.player.boost[1].cnt >= 1) {
            console.log(`Have tapping guru, start using this`);
            await boost(access_token, 'turbo');
            energyRefill = doClick.player.boost[1].cnt;
            continue;
          } else {
            if (doClick.player.boost[0].cnt >= 1) {
              //   energyRefill = doClick.player.boost[0];
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
        //   await click(accToken, , time);
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
