const needle = require('needle');
const fs = require('fs/promises');

const url = '';
const cookie = ''

const writeLog = async (message) => {
    await fs.writeFile('./logs.txt', `${new Date().toString().substring(0, 24)}: ${message}\n`, { flag: 'a+' })
}

const findImage = async (desiredImgBuff) => {
    const catalog = __dirname + '/captchas/';

    const filenames = await fs.readdir(catalog);

    for (const filename of filenames) {
        const imgBuff = await fs.readFile(catalog + filename);

        if (!Buffer.compare(desiredImgBuff, imgBuff)) return filename
    }

}

const getLastCaptchaIndex = async () => {
    const catalog = __dirname + '/captchas/';
    const filenames = await fs.readdir(catalog);

    return filenames.length;
}

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms))

const init = async () => {
    let index = await getLastCaptchaIndex() + 1;

    while (true) {

        try {
            const options = {
                headers: {
                    'Cookie': cookie
                }
            }
            const captchaPage = await needle('get', url, options);
            const body = captchaPage.body;
            const headers = captchaPage.headers;
    
            if (headers['content-type'] !== 'image/png') {
                await writeLog('no picture');
                process.exit();
            }

            const found = await findImage(body);

            await fs.writeFile('./captchas/' + index + '.png', body);

            if (found !== undefined) {
                await writeLog(found + ' - ' + index);
            }

            index++;
        } catch (err) {
            console.log('err in auth', err);
        }

        await delay(Math.random()*100);
    }
}

init()




