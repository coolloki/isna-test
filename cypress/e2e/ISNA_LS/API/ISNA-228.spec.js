import Commons from '../../../fixtures/COMMON/Commons'
import Payment from '../../../fixtures/ISNA_LS/objects/payment'
import Date from '../../../fixtures/COMMON/Date'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-228_test_data.json'

const payment = new Payment()
const todayDate = new Date().getTodayDate()
//external_code и генерируются заранее для всех кейсов
testDataSource.forEach(iteration => {
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})


describe('ISNA-228 : Обработка Онлайн платежей (не бюджет) - проверка маппинга', () => {

    before(() => {
        //Отправляем платежи
        testDataSource.forEach(caseData => {
            payment.sendPaymentToGTM(caseData.payment)
        })
        //Ожидание, чтобы платежи успели обработаться
        cy.wait(4500)
    })

    testDataSource.forEach((caseData) => {

        it(caseData.testTittle + ' c КНП ' + caseData.payment.knp, function () {

            //В paymentParamToCheck помещаем свойство объекта result проверки кейса
            const paymentParamToCheck = caseData.result

            //Добавляем текущую дату в paymentParamToCheck 
            paymentParamToCheck.document_date = todayDate
            paymentParamToCheck.receipt_date = todayDate
            paymentParamToCheck.write_off_date = todayDate

            //Проверяем платеж
            payment.checkPaymentByExternalCode(caseData.payment.external_code, paymentParamToCheck)
        })
    })
})