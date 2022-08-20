import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import Commons from '../../../fixtures/COMMON/Commons'
import Svod from '../../../fixtures/ISNA_LS/objects/Svod'
import Date from '../../../fixtures/COMMON/Date'

import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-255_test_data.json'

const payment = new Payment()
const svod = new Svod()
//const date = new Date()
const svodType = 'svodNoBudget'
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration => {
    const paymentParam = iteration.payment
    const paymentDate = new Date().getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.businessDaysSubtract)
    paymentParam.payDate = paymentDate
    paymentParam.docDate = paymentDate
    const external_code = new Commons().generateUUID()
    paymentParam.assign = paymentParam.assign.replace('255', '464')
    paymentParam.external_code = external_code
    iteration.result.payment_source = '8'
    iteration.result.de_source_system_id ='36'
    iteration.result.assignment_payment = iteration.result.assignment_payment.replace('255', '464')
})

describe("ISNA-463. Обработка платежей из Свода не бюджет негативные сценарии, проверка кодов ошибок", () => {

    before(() => {
        //Создаем массив с платежами для Свода
        let paymentsToSvod = []
        testDataSource.forEach(caseData => {
            paymentsToSvod.push(caseData.payment)
        })
        //Отправяем Свод
        svod.sendSvodToGTM(paymentsToSvod, svodType)
        cy.wait(4500)
    })

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {
            const paymentResult = caseData.result
            payment.checkPaymentByExternalCode(caseData.payment.external_code, paymentResult)
        })
    })
})
