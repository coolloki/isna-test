import Commons from '../../../fixtures/COMMON/Commons'
import Payment from '../../../fixtures/ISNA_LS/objects/payment'
import Svod from '../../../fixtures/ISNA_LS/objects/Svod'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-461_test_data.json'

const payment = new Payment()
const svodType = 'svodNoBudget'
const svod = new Svod()

//external_code и reference генерируются заранее для всех кейсов
testDataSource.forEach(oneCase => {
    oneCase.payment.external_code = new Commons().generateUUID()
    oneCase.payment.reference = new Commons().generateUUID()
})
describe('ISNA-461. Проверка подтверждения Онлайн платежа Сводом БВУ не бюджет', function () {

    before(() => {

        //Отправляем Онлайн платежи
        // и если у платежейесть признак confirmedBySvod, то добавляем платежи в массив для отправки в Своде 
        let paymentsToSvod = []
        testDataSource.forEach(oneCase => {
            if(oneCase.payment.changeAmount){
                oneCase.payment.amount += 2
            }
            payment.sendPaymentToGTM(oneCase.payment)
            if (oneCase.payment.confirmedBySvod) paymentsToSvod.push(oneCase.payment)
        })
        //Ожидаем, чтобы Онлайн платежи разнеслись
        cy.wait(3000)

        //Отправляем Свод
        svod.sendSvodToGTM(paymentsToSvod, svodType)

        //Ожидаем, чтобы платежи из Свода разнеслись
        cy.wait(4000)
    })

    testDataSource.forEach(Case => {
        it(Case.title, function () {

            svod.getActiveSvodsIdByType(svodType).then((response) => {
                const svodId = response[0].id
                const result = Case.result
                if(Case.payment.confirmedBySvod) result.ri_payment_registry_pshep_id = svodId

                payment.checkPaymentByExternalCode(Case.payment.external_code, result)
            })
        })
    })
})
