module.exports = async(options = {}) => {
    let { wrapper, url } = options

    // The amap site
    // body
    //  div
    //      col
    //          amap item <-- we need to parse this item
    //      col
    //          amap item
    //  div (footer)
    //      col
    //      col
    //      col
    //      col

    let results = []
    await wrapper.page.goto(url)
    let { items, $ } = await wrapper.queryAll('body')
    let footer = false
    let cursor = 3
    do {
        let div = items.find(`div:nth-child(${cursor})`)
        let cols = div.find('.row > div').toArray()
        if (cols.length !== 2) {
            footer = true
        } else {
            results.push(parseItem($(cols[0]), $))
            results.push(parseItem($(cols[1]), $))
            cursor++
        }
    } while (!footer)

    return results.filter(item => !!item.mail)

    function parseItem(el, $) {
        return {
            title: el
                .find('a')
                .first()
                .attr('title'),
            mail: el
                .find('a')
                .toArray()
                .filter(
                    a =>
                    $(a)
                    .attr('href')
                    .indexOf('mailto') !== -1
                )
                .map(el =>
                    $(el)
                    .attr('href')
                    .split('mailto:')
                    .join('')
                )[0]
                // html: el.html()
        }
    }
}