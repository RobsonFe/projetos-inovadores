import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote', '--single-process'],
    userDataDir: './tmp',
});

export default browser;