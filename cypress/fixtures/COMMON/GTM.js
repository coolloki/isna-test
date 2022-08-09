import Commons from "./Commons"

/**
 * Класс для взаимодействия с транспортным модулем
 */
class GTM {

    /**
     * Отправить сообщение на транспортны модуль
     * @param {String} message Cообщение в теге '\<message\>'
     * @param {String} type Тип сообщения ('paymentBudget' | 'paymentNoBudget' | 'svodBudget' | 'svodNoBudget')
     * @param {String} registryId ID свода, реестра
     */
    sendToGTM(message, type, registryId) {
        const wrappedMesage = this.#wrapMassageToGTM(message, type, registryId)

        cy.request({
            method: 'POST',
            url: Cypress.env('LS_GTM_API'),
            headers: {
                'Content-Type': 'text/xml',
                'Accept-Encoding': 'gzip, deflate, br',
                'charset': 'utf-8'
            },
            body: wrappedMesage
        })
    }

    #wrapMassageToGTM(message, type, registryId) {

        const commons = new Commons()
        let messageClass

        switch (type) {
            case 'paymentBudget':
                messageClass = 'ISNA_ONLINE_PAYMENT'
                message = '<message>' + message + '</message>\n'
                break
            case 'paymentNoBudget':
                messageClass = 'BT_PSHEP_ISNA_ONLINEPAYMENTGZVP'
                message = '<message>' + message + '</message>\n'
                break
            case 'svodBudget':
                messageClass = 'BT_PSHEP_ISNA_REGISTRYPAYMENT'
                message += '<message>' + message + '</message>'
                + '<partNumber>1</partNumber>'
                + '<registryId>' + registryId + '</registryId>'
                break
            case 'svodNoBudget':
                messageClass = 'BT_PSHEP_ISNA_REGISTRYPAYMENTGZVP'
                message += '<message>' + message + '</message>'
                    + '<partNumber>1</partNumber>'
                    + '<registryId>' + registryId + '</registryId>'
                break
        }


        const wrappedMessage = '<env:GovTalkMessage xmlns:env="http://www.govtalk.gov.uk/CM/envelope">\n'
            + '<env:EnvelopeVersion>1000.00</env:EnvelopeVersion>\n'
            + '<env:Header>\n'
            + '<env:MessageDetails>\n'
            + '<env:Class>' + messageClass + '</env:Class>\n'
            + '<env:Qualifier>request</env:Qualifier>\n'
            + '<env:Function>submit</env:Function>\n'
            + '<env:CorrelationID>' + commons.generateUUID() + '</env:CorrelationID>\n'
            + '</env:MessageDetails>\n'
            + '</env:Header>\n'
            + '<env:Body>\n'
            + '<messageEnvelope>\n'
            + message
            + '</messageEnvelope>\n'
            + '</env:Body>\n'
            + '</env:GovTalkMessage>\n'

        return wrappedMessage
    }

}

export default GTM