class SigningXML {

    #getXMLToSign(xml) {
        let xmlToSign = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" '
            + 'xmlns:web="http://web.service.eds.cits.kz/">'
        xmlToSign = xmlToSign + '<soapenv:Header/>'
        xmlToSign = xmlToSign + '<soapenv:Body>'
        xmlToSign = xmlToSign + '<web:getSignedXML>'
        xmlToSign = xmlToSign + '<xml><![CDATA['
        xmlToSign = xmlToSign + xml
        xmlToSign = xmlToSign + ']]></xml>'
        xmlToSign = xmlToSign + '<encoding>UTF-8</encoding>'
        xmlToSign = xmlToSign + '<algorithm>RSA</algorithm>'
        xmlToSign = xmlToSign + '</web:getSignedXML>'
        xmlToSign = xmlToSign + '</soapenv:Body>'
        xmlToSign = xmlToSign + '</soapenv:Envelope>'
        return xmlToSign
    }

    /**
     * ПОдпись XML через API ЦУЛС
     * @param {string} xml XML для подписи
     * @returns подписанный XML
     */
    getSignedXMLFromCitsApi(xml) {
        const signRequest = {
            method: 'POST',
            url: 'http://10.61.40.253:8031/EdsWebServiceBean/EdsWebService',
            headers: {
                'Content-Type': 'text/xml',
                'charset': 'UTF-8'
            },
            body: this.#getXMLToSign(xml)
        }
        return new Cypress.Promise((resolve, reject) => {
            cy.request(signRequest)
                .then(response => {
                    resolve(Cypress.$(Cypress.$.parseXML(response.body)).find('result').text())
                })
        })
    }


    /**
     * Подпись XML через API модуля Аудит
     * @param {string} xml XML для подписи
     * @returns подписанный XML
     */
    getSignedXMLFromAuditAPI(xml) {
        const signRequest = {
            method: 'POST',
            url: Cypress.env('AUDIT_API') + '/eds/sign',
            headers: {
                'Content-Type': 'application/xml',
                'charset': 'UTF-8'
            },
            body: xml
        }
        return new Cypress.Promise((resolve, reject) => {
            cy.request(signRequest)
                .then(response => resolve(response.body))
        })
    }
}
export default SigningXML