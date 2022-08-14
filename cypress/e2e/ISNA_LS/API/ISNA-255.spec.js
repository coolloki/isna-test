import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-255_test_date.json'
import Commons from '../../../fixtures/COMMON/Commons'
import Date from '../../../fixtures/COMMON/Date'

describe("ISNA-255. Обработка Онлайн платежей негативные сценарии, проверка кодов ошибок", () => {

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {

            const payment = new Payment()
            const external_code = new Commons().generateUUID()
            const date = new Date()
            
            const paymentParam = caseData.payment
            const paymentDate = date.getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.businessDaysSubtract)

            paymentParam.external_code = external_code
            paymentParam.payDate = paymentDate
            paymentParam.docDate = paymentDate

            const paymentResult = caseData.result
            
            payment.sendPaymentToGTM(paymentParam)

            cy.wait(4000)
            
            payment.checkPaymentByExternalCode(external_code, paymentResult)
        })
    })
})
