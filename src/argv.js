module.exports = {
    getValue(name) {
        let match = process.argv.find(
            str =>
            str.indexOf('--') === 0 &&
            str
            .split('--')
            .join('')
            .split('=')[0] == name
        )
        if (match) return match.split('=')[1]
        else return ''
    }
}