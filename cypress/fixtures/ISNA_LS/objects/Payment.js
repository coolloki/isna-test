import SigningXML from '../../COMMON/SigningXML'
import Commons from '../../COMMON/Commons'

class Payment {

    /**
    *Проверка платежа по external_code
    *@param {string} externalCode external_code платежа
    *@param {Object} expectations параметры которые будут проверяться. 
    * Например: {amount: '10', payment_doc_type_code: '35'}
    */
    checkPaymentByExternalCode(expernalCode, expectations) {
        cy.getPaymentByExternlCode(expernalCode)
            .then((payments) => {
                this.#checkPaymentParams(payments[0], expectations)
            })
    }

    #checkPaymentParam(payment, param, parmValue) {
        expect(payment[param]).to.be.eq(parmValue, 'Проверка ' + param)
    }

    #checkPaymentParams(payment, paramerts) {
        Object.entries(paramerts).map(
            ([param, paramValue]) => {
                this.#checkPaymentParam(payment, param, paramValue)
            }
        )
    }


    #wrapPaymentToGTM(codedPayment) {
        let messageClass = 'ISNA_ONLINE_PAYMENT'

        if(!codedPayment.isBudget) {
            messageClass = 'BT_PSHEP_ISNA_ONLINEPAYMENTGZVP'
        }

        let wrapedPayment = '<env:GovTalkMessage xmlns:env="http://www.govtalk.gov.uk/CM/envelope">'
        wrapedPayment = wrapedPayment + '<env:EnvelopeVersion>1000.00</env:EnvelopeVersion>'
        wrapedPayment = wrapedPayment + '<env:Header>'
        wrapedPayment = wrapedPayment + '<env:MessageDetails>'
        wrapedPayment = wrapedPayment + '<env:Class>' + messageClass + '</env:Class>'
        wrapedPayment = wrapedPayment + '<env:Qualifier>request</env:Qualifier>'
        wrapedPayment = wrapedPayment + '<env:Function>submit</env:Function>'
        wrapedPayment = wrapedPayment + '<env:CorrelationID>B585C55BC6F555629B2649D545975306</env:CorrelationID>'
        wrapedPayment = wrapedPayment + '</env:MessageDetails>'
        wrapedPayment = wrapedPayment + '</env:Header>'
        wrapedPayment = wrapedPayment + '<env:Body>'
        wrapedPayment = wrapedPayment + '<messageEnvelope>'
        wrapedPayment = wrapedPayment + '<message>'
        wrapedPayment = wrapedPayment + codedPayment.payment
        wrapedPayment = wrapedPayment + '</message>'
        wrapedPayment = wrapedPayment + '</messageEnvelope>'
        wrapedPayment = wrapedPayment + '</env:Body>'
        wrapedPayment = wrapedPayment + '</env:GovTalkMessage>'
        return wrapedPayment
    }

    #createOnlinePaymentXML(paymentParam) {
        let external_code = paymentParam.external_code
        if (!external_code) {
            external_code = new Commons().generateUUID()
        }

        let payDate = paymentParam.payDate
        if (!payDate) {
            payDate = new Commons().getTodayDate()
        }

        let docDate = paymentParam.docDate
        if (!docDate) {
            docDate = new Commons().getTodayDate()
        }

        let bankIdn = paymentParam.bankIdn
        if (!bankIdn) {
            bankIdn = '940140000385'
        }

        let bankBik = paymentParam.bankBik
        if (!bankBik) {
            bankBik = 'HSBKKZKX'
        }

        let bankName = paymentParam.bankName
        if (!bankName) {
            bankName = 'АО Народный Банк Республики Казахстан'
        }

        let xml = '<notificationPayment xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            + 'xmlns="http://payments.bee.kz/GatewayNkNotification">'
        xml = xml + '<reference>' + external_code + '</reference>'
        xml = xml + '<bankReference>' + external_code + '</bankReference>'
        xml = xml + '<payDate>' + payDate + '</payDate>'
        xml = xml + '<docDate>' + docDate + '</docDate>'
        xml = xml + '<amount>' + paymentParam.amount + '</amount>'
        xml = xml + '<payerIdn>' + paymentParam.payerIdn + '</payerIdn>'
        xml = xml + '<payerName>' + paymentParam.payerName + '</payerName>'
        xml = xml + '<bankIdn>' + bankIdn + '</bankIdn>'
        xml = xml + '<bankBik>' + bankBik + '</bankBik>'
        xml = xml + '<bankName>' + bankName + '</bankName>'
        if (paymentParam.isBudget) {
            xml = xml + '<treasuryIdn>' + paymentParam.treasuryIdn + '</treasuryIdn>'
            xml = xml + '<treasuryName>' + paymentParam.treasuryName + '</treasuryName>'
            xml = xml + '<kno>' + paymentParam.kno + '</kno>'
            xml = xml + '<kbk>' + paymentParam.kbk + '</kbk>'
        }
        xml = xml + '<knp>' + paymentParam.knp + '</knp>'
        xml = xml + '<vo>' + paymentParam.vo + '</vo>'
        xml = xml + '<docNumber>' + paymentParam.docNumber + '</docNumber>'
        xml = xml + '<assign>' + paymentParam.assign + '</assign>'
        xml = xml + '</notificationPayment>'
        return xml
    }

    #getSignedPayment(paymentXML) {
        const signedPayment = new SigningXML().getSignedXMLFromAuditAPI(paymentXML)
        return signedPayment
    }

    /**
     * Отправить платеж через GTM
     * @param {Object} paymentParam - Параметры платежа. Например: {
                isBudget: true,
                //payDate: '',
                //docDate: '',
                amount: '500',
                payerIdn: '830427350299',
                payerName: 'AutoTest',
                treasuryName: 'OGD_NAME',
                treasuryIdn: '980740001362',
                kno: '620201',
                kbk: '104401',
                knp: '911',
                vo: '01',
                docNumber: 'TEST1111',
                assign: 'Назначение',
                external_code: 'референсы'
        }
     */


    sendPaymentToGTM(paymentParam) {

        const paymnetXML = this.#createOnlinePaymentXML(paymentParam)

        this.#getSignedPayment(paymnetXML)
            .then((result) => {
                const codedPayment = {
                    isBudget: paymentParam.isBudget,
                    payment: Buffer.from(decodeURIComponent(encodeURIComponent(result))).toString('base64')
                }
                return codedPayment
            })
            .then(this.#wrapPaymentToGTM)
            .then((result) => {
                cy.request({
                    method: 'POST',
                    url: Cypress.env('LS_GTM_API'),
                    headers: {
                        'Content-Type': 'text/xml',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'accept': null
                    },
                    body: result
                })
            })
    }

}
export default Payment