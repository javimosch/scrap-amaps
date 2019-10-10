const puppeteer = require('puppeteer')
var browser = null

var puppeteerOptions = {
    headless: process.env.HEADLESS !== '0',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}

async function getBrowserPage() {
    await closeBrowser()
    browser = await puppeteer.launch(puppeteerOptions)
    return await browser.newPage()
}
async function closeBrowser() {
    if (browser !== null) {
        await browser.close()
    }
}

module.exports = {
    setPuppeteerOptions(options = {}) {
        puppeteerOptions = {
            ...puppeteerOptions,
            ...options
        }
    },
    getBrowserPage,
    closeBrowser,
    async getWrapper() {
        return {
            page: await getBrowserPage(),
            async queryAll(selector, options = {}) {
                var { items, $ } = await queryAll(selector, {
                    page: this.page,
                    ...options
                })
                var map = function(handler) {
                    return items.toArray().map((el, index) => handler($(el), index))
                }
                return {
                    items,
                    $,
                    map
                }
            },
            async findByContent(content) {
                let { items, $ } = await this.queryAll('body', {
                    waitContent: content
                })
                const cheerio = require('cheerio')
                let html = $(items[0]).html()
                if (html.indexOf(content) !== -1) {
                    let pos = html.indexOf(content)
                    for (var start = pos; start > 0; start--) {
                        if (html.charAt(start) === '<') {
                            for (var end = pos; end < html.length - 1; end++) {
                                if (html.charAt(end) === '>') {
                                    let tagHTML = html.substring(start, end + 1)

                                    const cheerio = require('cheerio')
                                    const $$ = cheerio.load(tagHTML)
                                    let body = $$($$('body').first())
                                    let el = $$($$('body > *').first())
                                    let id = require('uniqid')()
                                    el.attr('id', id)
                                    let newTagHTML = body.html()

                                    html = html.split(tagHTML).join(newTagHTML)

                                    let $ = cheerio.load(html)
                                    return {
                                        item: $(`#${id}`),
                                        $
                                    }
                                }
                            }
                        }
                    }
                } else {
                    return null
                }
            }
        }
    }
}

async function queryAll(selector, options = {}) {
    const { page } = options
    const bodyHandle = await page.$('body')
    const cheerio = require('cheerio')
    return new Promise((resolve, reject) => {
        var startDate = Date.now()
        async function check() {
            html = await page.evaluate(body => body.innerHTML, bodyHandle)
            const $ = cheerio.load(html)

            if (options.waitContent) {
                if ($.html().indexOf(options.waitContent) == -1) {
                    return iterate()
                }
            }

            let items = $(selector)
            if (items.length !== 0) {
                resolve({ items, $ })
            } else {
                iterate()
            }

            function iterate() {
                if (Date.now() - startDate > (options.timeout || 10000)) {
                    reject(new Error('TIMEOUT'))
                } else {
                    setTimeout(() => check(), 1000)
                }
            }
        }
        check()
    })
}