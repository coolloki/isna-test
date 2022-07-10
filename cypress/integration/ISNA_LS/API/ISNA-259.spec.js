import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-259_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'

describe("ISNA-259. Обработка Онлайн платежей с ИИН в назначении платеж", () => {

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
