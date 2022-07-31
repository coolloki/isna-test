import Pako from 'pako'

/**
 * Класс с общими командами применяемыми в разных модулях
 */
class Commons {

    /**
     * Генерация uuid
     * @returns возвращает uuid
     */
    generateUUID() {
        var s = []
        var hexDigits = '0123456789abcdef'
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = '4'
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
        s[8] = s[13] = s[18] = s[23] = '-'
        var uuid = s.join('')
        return uuid
    }

    /**
     * Сжатие в gzip и кодирование в base64
     * @param {String} message - стока, которую нужно сжать
     * @returns {String} возвращает сжатую и закодированную строку
     */
    getGzipMessage(message) {
        const gzipMessage = Pako.gzip(message)
        const base64Message = Buffer.from(gzipMessage).toString('base64')
        return base64Message
    }

}
export default Commons