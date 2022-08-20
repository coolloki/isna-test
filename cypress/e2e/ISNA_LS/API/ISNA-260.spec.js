import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import Date from '../../../fixtures/COMMON/Date'
import Commons from '../../../fixtures/COMMON/Commons'

import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-260_test_data.json'

const payment = new Payment()
const date = new Date()
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration => {
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})


describe("ISNA-260. Обработка Онлайн платежей бюджет негативные сценарии, проверка кодов ошибок", () => {

    before(() => {
        testDataSource.forEach(caseData => {
            const paymentParam = caseData.payment
            const paymentDate = date.getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.businessDaysSubtract)
            paymentParam.payDate = paymentDate
            paymentParam.docDate = paymentDate
            payment.sendPaymentToGTM(paymentParam)
        })
        cy.wait(4500)
    })

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {
            const paymentResult = caseData.result
            payment.checkPaymentByExternalCode(caseData.payment.external_code, paymentResult)
        })
    })
})
