import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import Commons from '../../../fixtures/COMMON/Commons'
import Date from '../../../fixtures/COMMON/Date'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-255_test_data.json'

const payment = new Payment()
const date = new Date()
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration => {
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})

describe("ISNA-255. Обработка Онлайн платежей не бюджет негативные сценарии, проверка кодов ошибок", () => {

    before(() => {
        //Отправляем платежи
        testDataSource.forEach(caseData => {
            const paymentParam = caseData.payment
            const paymentDate = date.getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.businessDaysSubtract)
            paymentParam.payDate = paymentDate
            paymentParam.docDate = paymentDate
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
