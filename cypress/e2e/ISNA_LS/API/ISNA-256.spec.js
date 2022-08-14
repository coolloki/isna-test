import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-256_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'

describe("ISNA-256. Обработка Онлайн платежа Не бюджет в зависимости от рег.учета", () => {

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {

            const payment = new Payment()
            const external_code = new Commons().generateUUID()
            
            const paymentParam = caseData.payment

            paymentParam.external_code = external_code

            const paymentResult = caseData.result
            
            payment.sendPaymentToGTM(paymentParam)

            cy.wait(4000)
            
            payment.checkPaymentByExternalCode(external_code, paymentResult)
        })
    })
})
