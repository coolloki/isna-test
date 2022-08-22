import Commons from '../../../fixtures/COMMON/Commons'
import Payment from '../../../fixtures/ISNA_LS/objects/payment'
import Svod from '../../../fixtures/ISNA_LS/objects/Svod'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-614_test_data.json'

const payment = new Payment()
const svodType = 'svodNoBudget'
const svod = new Svod()

//external_code и reference генерируются заранее для всех кейсов
testDataSource.forEach(oneCase => {
    oneCase.payment.external_code = new Commons().generateUUID()
    oneCase.payment.reference = new Commons().generateUUID()
})
describe('ISNA-614. Проверка Онлайн платежа Сводом БВУ не бюджет в зависимости от рег. учета', function () {

    before(() => {

        //Отправляем Онлайн платежи
        // и если у платежейесть признак confirmedBySvod, то добавляем платежи в массив для отправки в Своде 
        let paymentsToSvod = []
        testDataSource.forEach(oneCase => {
            paymentsToSvod.push(oneCase.payment)
        })
        //Отправляем Свод
        svod.sendSvodToGTM(paymentsToSvod, svodType)

        //Ожидаем, чтобы платежи из Свода разнеслись
        cy.wait(4000)
    })

    testDataSource.forEach(Case => {
        it(Case.testTittle, function () {
            payment.checkPaymentByExternalCode(Case.payment.external_code, Case.result)
        })
    })
})
