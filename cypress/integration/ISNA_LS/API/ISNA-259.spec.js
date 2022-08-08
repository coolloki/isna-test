import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-259_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'

const payment = new Payment()
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration =>{
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})

describe("ISNA-259. Обработка Онлайн платежей с ИИН в назначении платеж", () => {

    before(() => {

        testDataSource.forEach(caseData =>{
            payment.sendPaymentToGTM(caseData.payment)
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
