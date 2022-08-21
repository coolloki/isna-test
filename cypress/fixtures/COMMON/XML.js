/**
 * Класс для проверки XML
 */
class XML {

    /**
     * Проверка XML
     * @param {String} xml проверяемая XML
     * @param {Object} expectations объект в соответсвием с которым будет проверятся XML
     */
    async checkXML(xml, expectations) {
        const newObject = await this.#parseXML2JS(xml)
        const preraredObject = this.#prepareObject(newObject)
        this.#checkObject(preraredObject, expectations)
    }

    #checkObject(obj, expectations) {
        cy.wrap(null, { log: false }).should(() => {
            for (var item in expectations) {
                if (typeof (expectations[item]) !== 'object') {
                    expect(obj[item]).to.eq(expectations[item], 'Проверка ' + item)
                } else {
                    this.#checkObject(obj[item], expectations[item])
                }
            }
        })
    }

    #prepareObject(obj) {
        for (var prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop)) {
                delete obj['ds:Signature']
                return obj[prop]
            }
        }
    }

    #parseXML2JS(xml) {
        const xml2js = require('xml2js')
        const parser = new xml2js.Parser({ attrkey: "ATTR", explicitArray: false, ignoreAttrs: true })
        const parsedXML = new Cypress.Promise((resolve, reject) => {
            parser.parseString(xml, (error, result) => {
                if (error) reject(error)
                else {
                    resolve(result)
                }
            })
        })
        return parsedXML
    }
}

export default XML