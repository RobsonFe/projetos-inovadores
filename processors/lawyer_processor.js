import fs from 'fs';

import browser from '../utils/browser.js';
import { humanisticMouseMovement, humanizeDelay, randomizeViewPort } from '../utils/helpers.js';


async function checkEntes (page, cursor) {
  humanizeDelay();
  console.log('====================================');
  console.log({
    message: 'Iniciando a extração de dados',
    date: new Date(),
    params: {
      page,
      cursor,
    }
  });
  console.log('====================================');
  await page.close();
  await browser.close();
}

export default checkEntes;