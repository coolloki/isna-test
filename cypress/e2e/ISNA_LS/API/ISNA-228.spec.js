import Commons from '../../../fixtures/COMMON/Commons'
import Payment from '../../../fixtures/ISNA_LS/objects/payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-228_test_data.json'


describe('ISNA-228 : Обработка Онлайн платежей (не бюджет) - проверка маппинга', () => {

    before(() => {
        cy.getTodayDate()
    })

    testDataSource.forEach((caseData) => {

        it(caseData.testTittle, function () {

            if (caseData.skip) {
                cy.log(caseData.reason_of_skip)
            }
            else {

                //Создание объекта платеж с доступными методами sendPaymentToGTM и checkPaymentByExternalCode
                const payment = new Payment()

                //генерируем uuid для платежа
                const external_code = new Commons().generateUUID()

                //В paymentParam помещаем свойство объекта payment одного кейса
                const paymentParam = caseData.payment

                //В paymentParamToCheck помещаем свойство объекта result проверки кейса
                const paymentParamToCheck = caseData.result

                //Добавляем к объекту paymentParam сгенерированный ренее external_code
                paymentParam.external_code = external_code

                //Отправляем платеж
                payment.sendPaymentToGTM(paymentParam)

                //Ожидание для стабильности теста
                cy.wait(4000)

                //Добавляем текущую дату в paymentParamToCheck 
                paymentParamToCheck.document_date = this.todayDateUs
                paymentParamToCheck.receipt_date = this.todayDateUs
                paymentParamToCheck.write_off_date = this.todayDateUs

                //Проверяем платеж
                payment.checkPaymentByExternalCode(external_code, paymentParamToCheck)
            }
        })
    })
})
