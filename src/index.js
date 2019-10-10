let argv = require('./argv')
let puppeteer = require('./puppeteer')

puppeteer.setPuppeteerOptions({
    headless: argv.getValue('headless').toString() !== '0'
})

test()

async function test() {
    let wrapper = await puppeteer.getWrapper()

    // Scrap single city amaps (title and email) example
    let amaps = await require('./scripts/scrapCityAmaps')({
        url: 'https://www.avenir-bio.fr/amap,herault,34,montpellier.html',
        wrapper
    })

    console.log('AMAPS', amaps)

    puppeteer.closeBrowser()
}