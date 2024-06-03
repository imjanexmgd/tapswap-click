import fs from 'node:fs';
import ora from 'ora';
import axios from 'axios';
import { setInterval } from 'node:timers/promises';
import * as cheerio from 'cheerio';
const getAccToken = async (query) => {
  console.log(`(,,>﹏<,,)`);
  let attempts = 0;
  let maxAttempts = 1;
  let chq = '';
  while (attempts <= maxAttempts) {
    try {
      let json;
      if (!chq) {
        json = {
          init_data: query,
          referrer: '',
          bot_key: 'app_bot_0',
        };
      } else {
        // source https://github.com/shamhi/TapSwapBot/blob/main/bot/core/tapper.py
        json = {
          chr: chq,
          init_data: query,
          referrer: '',
          bot_key: 'app_bot_0',
        };
      }
      const { data } = await axios.post(
        'https://api.tapswap.ai/api/account/login',
        json,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Build/RQ3A.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'sec-ch-ua':
              '"Not_A Brand";v="8", "Chromium";v="120", "Android WebView";v="120"',
            'x-bot': 'no',
            'sec-ch-ua-mobile': '?1',
            'x-cv': '608',
            'x-app': 'tapswap_server',
            'sec-ch-ua-platform': '"Android"',
            Origin: 'https://app.tapswap.club',
            'X-Requested-With': 'app.mdgram.android',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://app.tapswap.club/',
            'Accept-Language': 'en,en-US;q=0.9',
          },
        }
      );

      if (data.chq) {
        chq = await extractChqResult(data.chq);
      }
      if (data.access_token) {
        console.log(`success login`);
        return data;
      }
    } catch (error) {
      attempts += 1;
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.log(`Attempt ${attempts} failed get acc token retrying...`);
    }
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
      console.log(`Success claim energy refill`);
    } else {
      console.log(`Succes claim turbo guru boost`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
const extractChqResult = async (chq) => {
  try {
    console.log(`bypassing chq 👉👈`);
    const x = 157;
    const len = chq.length;
    const bytesArray = Buffer.alloc(len / 2);
    // source https://github.com/Poryaei/TapSwap-Clicker/blob/main/tapswap.py
    for (let t = 0; t < len; t += 2) {
      bytesArray[t / 2] = parseInt(chq.slice(t, t + 2), 16);
    }
    const xored = Buffer.from(bytesArray.map((byte) => byte ^ x));
    const decoded = xored.toString('utf-8');
    const jsCode = decoded
      .split(
        'try {eval("document.getElementById");} catch {return 0xC0FEBABE;}'
      )[1]
      .split('\n');
    let va_1 = jsCode[6].split('_')[1];
    let va_2 = jsCode[6].split('_')[2].split('')[0];
    let va = `_${va_1}_${va_2}`;
    let vb_1 = jsCode[7].split('_')[1];
    let vb_2 = jsCode[7].split('_')[2].split('')[0];
    let vb = `_${vb_1}_${vb_2}`;
    const randInt = jsCode[8].split(' ')[5].slice(0, -1);
    const html = jsCode[5].split(' = ')[1].slice(0, -1);
    const $ = cheerio.load(html);
    const elementVa = $(`#${va}`);
    if (elementVa) {
      va = elementVa.attr('_d_');
    } else {
      throw new Error('failed get va');
    }
    const elementVb = $(`#${vb}`);
    if (elementVb) {
      vb = elementVb.attr('_d_');
    } else {
      throw new Error('failed get vb');
    }
    const chr = (parseInt(va) * parseInt(vb)) % parseInt(randInt);
    return chr;
  } catch (error) {
    throw error;
  }
};
(async () => {
  try {
    while (true) {
      process.stdout.write('\x1Bc');
      console.log(`created with ♡ by janexmgd\n\n`);
      const reqTxt = fs.readFileSync('req.txt', 'utf-8').replace(/\r/g, '');
      const arrAcc = reqTxt.split('\n');
      for (const acc of arrAcc) {
        const init_data = acc.split(' ')[0];
        const accInfo = await getAccToken(init_data);
        const { access_token, player } = accInfo;
        console.log(`Login as ${player.full_name}`);
        let energyRefill = player.boost[0].cnt;
        const playerid = player.id;
        let doClick;
        while (energyRefill >= 0) {
          energyRefill = player.boost[0];
          let energy = player.energy;
          let tapLevel = player.tap_level;

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
        let boostGuru = player.boost[1].cnt;
        let claimBoostGuru;
        if (boostGuru >= 1) {
          console.log(`Have ${boostGuru} turbo tap`);
          claimBoostGuru = await boost(access_token, 'turbo');
          let i = 1;
          while (true) {
            doClick = await clicks(access_token, 1, playerid);
            const json = {
              totalCLick: padNumber(i, 4),
              end: doClick.player.boost[1].end,
              currentTurboTap: doClick.player.boost[1].cnt,
            };
            console.log(json);
            if (doClick.player.boost[1].end <= Date.now()) {
              if (doClick.player.boost[1].cnt >= 1) {
                claimBoostGuru = await boost(access_token, 'turbo');
                console.log(
                  `Current boost guru ${claimBoostGuru.player.boost[1].cnt}`
                );
              } else {
                console.log('no tapping guru');
                break;
              }
            }
            i++;
          }
        }
        console.log(`process done ${player.full_name} \n \n`);
      }
      const delayInSeconds = 300;
      let remainingSeconds = delayInSeconds;

      const spinner = ora(`Delaying ${remainingSeconds} second`).start();
      const interval = 1000;
      for await (const startTime of setInterval(interval, Date.now())) {
        remainingSeconds -= 1;
        spinner.text = `Delaying ${remainingSeconds} second 🗿`;
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
