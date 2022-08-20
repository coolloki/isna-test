import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-256_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'

const payment = new Payment()
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration => {
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})

describe("ISNA-256. Обработка Онлайн платежа Не бюджет в зависимости от рег.учета", () => {

    before(() => {
        //Отправляем платежи
        testDataSource.forEach(caseData => {
            payment.sendPaymentToGTM(caseData.payment)
        })
        //Ожидание, чтобы платежи успели обработаться
        cy.wait(4500)
    })

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {
            const paymentResult = caseData.result
            payment.checkPaymentByExternalCode(caseData.payment.external_code, paymentResult)
        })
    })
})
