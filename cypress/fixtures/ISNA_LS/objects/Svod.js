import SigningXML from '../../COMMON/SigningXML'
import Commons from '../../COMMON/Commons'
import GTM from '../../COMMON/GTM'
import Date from '../../COMMON/Date'

/**
 * Класс для взаимодейсвия со Сводами БВУ
 */
class Svod {

    /**
     * Отправить Свод БВУ через GTM - транспортный модуль
     * @param {Array.<Object>} payments Объект с платежи
     * @param {Boolean} payments.payment.confirmedBySvod Признак по которому платежи направляются в Свод
     * @param {String} type Тип свода ('svodBudget' | 'svodNoBudget')
     */
    async sendSvodToGTM(payments, type) {
        const gtm = new GTM()
        const paymentsCount = this.#getPaymentsCount(payments)
        const registryId = new Commons().generateUUID()

        this.#changeActiveSvodDate(type)

        this.#sendNotice(registryId, type, paymentsCount)

        const svod = this.#createSvod(payments, registryId, paymentsCount)
        const signXML = new SigningXML()
        const signedSvod = await signXML.getSignedXMLFromAuditAPI(svod)

        const gzipMessage = new Commons().getGzipMessage(signedSvod)

        gtm.sendToGTM(gzipMessage, type, registryId)
    }

    #createSvod(payments, registryId, paymentsCount, svodDate) {

        const paymentsAmount = this.#getPaymentsAmount(payments)
        const paymentsXML = this.#getPaymentsXML(payments)

        let registryDateFrom = svodDate
        if (!registryDateFrom) {
            registryDateFrom = new Date().getTodayDate()
        }

        const registryDateTo = registryDateFrom

        const svod = '<?xml version="1.0" encoding="utf-8"?>'
            + '<paymentRegistry xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            + '<registryId>' + registryId + '</registryId>'
            + '<registryDateFrom>' + registryDateFrom + '</registryDateFrom>'
            + '<registryDateTo>' + registryDateTo + '</registryDateTo>'
            + '<registryAmount>' + paymentsAmount + '</registryAmount>'
            + '<registryCount>' + paymentsCount + '</registryCount>'
            + '<payments>'
            + paymentsXML
            + '</payments>'
            + '</paymentRegistry>'

        return svod
    }

    #getPaymentsAmount(payments) {
        let registryAmount = 0
        payments.forEach(payment => registryAmount += parseInt(payment.amount))
        return registryAmount
    }

    #getPaymentsCount(payments) {
        let registryCount = 0
        payments.forEach(() => registryCount += 1)
        return registryCount
    }

    #getPaymentsXML(payments) {
        let paymentsXML = ''
        payments.forEach(payment => paymentsXML += this.#createPaymentXML(payment))
        return paymentsXML
    }

    #createPaymentXML(paymentParam) {
        const todayDate = new Date().getTodayDate()

        let external_code = paymentParam.external_code

        if(!external_code) external_code = new Commons().generateUUID() 

        let payDate = paymentParam.payDate
        if (!payDate) payDate = todayDate

        let docDate = paymentParam.docDate
        if (!docDate) docDate = todayDate

        let bankIdn = paymentParam.bankIdn
        if (!bankIdn) bankIdn = '940140000385'

        let bankBik = paymentParam.bankBik
        if (!bankBik) bankBik = 'HSBKKZKX'

        let bankName = paymentParam.bankName
        if (!bankName) bankName = 'АО Народный Банк Республики Казахстан'

        let reference = paymentParam.reference
        if (!reference) reference = new Commons().generateUUID()

        let xml = '<payment>'
        xml += '<reference>' + reference + '</reference>'
        xml += '<bankReference>' + external_code + '</bankReference>'
        xml += '<summaryBankReference>' + external_code + '</summaryBankReference>'
        xml += '<payDate>' + payDate + '</payDate>'
        if (!paymentParam.docDateNotExist) xml += '<docDate>' + docDate + '</docDate>'
        xml += '<amount>' + paymentParam.amount + '</amount>'
        xml += '<payerIdn>' + paymentParam.payerIdn + '</payerIdn>'
        xml += '<payerName>' + paymentParam.payerName + '</payerName>'
        xml += '<bankIdn>' + bankIdn + '</bankIdn>'
        xml += '<bankBik>' + bankBik + '</bankBik>'
        xml += '<bankName>' + bankName + '</bankName>'
        if (paymentParam.isBudget) {
            xml += '<treasuryIdn>' + paymentParam.treasuryIdn + '</treasuryIdn>'
            xml += '<treasuryName>' + paymentParam.treasuryName + '</treasuryName>'
            xml += '<kno>' + paymentParam.kno + '</kno>'
            xml += '<kbk>' + paymentParam.kbk + '</kbk>'
        }
        xml += '<knp>' + paymentParam.knp + '</knp>'
        xml += '<vo>' + paymentParam.vo + '</vo>'
        xml += '<docNumber>' + paymentParam.docNumber + '</docNumber>'
        xml += '<assign>' + paymentParam.assign + '</assign>'
        xml += '</payment>'
        return xml
    }

    #sendNotice(registryId, type, paymentsCount) {
        const noticeMessage = this.#createNotice(registryId, type, paymentsCount)
        cy.request({
            method: 'POST',
            url: Cypress.env('LS_WS_API'),
            headers: {
                'Content-Type': 'text/xml',
                'Accept-Encoding': 'gzip, deflate, br',
                'charset': 'utf-8'
            },
            body: noticeMessage
        })
    }

    #createNotice(registryId, type, paymentsCount) {
        const commons = new Commons()

        let registryType
        switch (type) {
            case ('svodBudget'):
                registryType = '0'
                break
            case ('svodNoBudget'):
                registryType = '1'
                break
        }

        const notice = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usc="http://epam.com/esb/usc">'
            + '<soapenv:Header/>'
            + '<soapenv:Body>'
            + '<usc:SendData>'
            + '<usc:data><![CDATA['
            + '<SyncRequestMsg xmlns:ns2="http://epam.com/esb/usc">'
            + '<EnvelopeVersion>1</EnvelopeVersion>'
            + '<Header>'
            + '<SessionId>' + commons.generateUUID() + '</SessionId>'
            + '<Class>USC_ISNA_REGISTRYPAYMENT_NOTIFI</Class>'
            + '<Sender>'
            + '<Login>culs</Login>'
            + '<Password>culs</Password>'
            + '</Sender>'
            + '</Header>'
            + '<Body>'
            + '&lt;registryNotification xmlns=&quot;http://payments.bee.kz/GatewayRegistry/Notification&quot; '
            + 'xmlns:xsd=&quot;http://www.w3.org/2001/XMLSchema&quot; '
            + 'xmlns:xsi=&quot;http://www.w3.org/2001/XMLSchema-instance&quot;&gt;'
            + '&lt;id&gt;' + commons.generateUUID() + '&lt;/id&gt;'
            + '&lt;registryId&gt;' + registryId + '&lt;/registryId&gt;'
            + '&lt;registryType&gt;' + registryType + '&lt;/registryType&gt;'
            + '&lt;paymentCount&gt;' + paymentsCount + '&lt;/paymentCount&gt;'
            + '&lt;partCount&gt;1&lt;/partCount&gt;'
            + '&lt;/registryNotification&gt;'
            + '</Body>'
            + '</SyncRequestMsg>]]></usc:data>'
            + '</usc:SendData>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>'

        return notice
    }

    /**
     * Получение ID активного свода  
     * @param {String} type Тип свода ('svodBudget' | 'svodNoBudget')
     * @returns {String} ID свода
     */
    getActiveSvodsIdByType(type) {

        const todayDate = new Date().getTodayDate()

        switch (type) {
            case 'svodBudget':
                type = 16
                break
            case 'svodNoBudget':
                type = 36
                break
        }

        const sqlScript = `select id 
        from ri_payment_registry 
        where registry_date = '` + todayDate + `'
        and status in (2,5)
        and de_source_system_id = ` + type + `;`

        return new Cypress.Promise((resolve, reject) => {
            cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: sqlScript }, { log: true })
                .then(response => resolve(response))
        })
    }

    async #changeActiveSvodDate(type) {
        const newDate = new Date().getSubstractDate('YYYY-MM-DD', 1, 'day')

        const svodIds = await this.getActiveSvodsIdByType(type)

        svodIds.forEach(svod => {
            const sqlScript = `UPDATE ri_payment_registry 
            SET registry_date='` + newDate + `' 
            WHERE id=` + svod.id + `;`

            cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: sqlScript }, { log: true })
        })
    }
}

export default Svod