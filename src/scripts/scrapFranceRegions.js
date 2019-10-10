module.exports = async(options = {}) => {
    let { wrapper } = options

    let globalListUrl = 'https://www.avenir-bio.fr/annuaire_amap.php'

    await wrapper.page.goto(globalListUrl)

    // Find the first dom element who contents (innerHTML) contains the follow string
    let { item, $ } = await wrapper.findByContent('Cliquez sur votre')

    // From there, retrieve all the regions directly
    let regions = item
        .parent()
        .parent()
        .find('h3 > a')
        .toArray()
        .map(el => $(el).html())

    console.log('France regions', regions)

    // For this simple task, we can query the entire html directly
    console.log(
        'France regions (simplier way)',
        (await wrapper.queryAll('h3 > a')).map(el => el.html())
    )
}