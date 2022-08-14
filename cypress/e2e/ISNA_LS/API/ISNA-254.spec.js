import PersonalAccount from "../../../fixtures/ISNA_LS/objects/PersonalAccount"
import Payment from "../../../fixtures/ISNA_LS/objects/Payment"
import testData from "../../../fixtures/ISNA_LS/tests_data/ISNA-254_test_data.json"

describe('ISNA-254 : Проверка создания ЛС при обработке Онлайн платежей', () => {

    testData.forEach((caseDate) => {

        it(caseDate.testTittle, function () {
            //Создание объекта payment
            const payment = new Payment()
            // Создание объекта ЛС
            const personalAccount = new PersonalAccount()

            //Создаем объекты paymentParam, personalAccountParam, operationParam на основе тестовых данных
            const paymentParam = caseDate.payment
            const personalAccountParam = caseDate.persAccount
            const operationParam = caseDate.operationParam

            //Закрываем существующий ЛС установкой в close_date текущей даты
            personalAccount.setCloseDateforPersonalAccount(personalAccountParam)

            //Проверяем, что открытый ЛС отсутсвует
            personalAccount.getActivePersonalAccount(personalAccountParam)
                .then((result) => {
                    expect(result).be.empty
                })

            //Направляем платеж
            payment.sendPaymentToGTM(paymentParam)

            //Ожидание для стабильности теста, в противном случае запрос в БД может вернуть пустое значение.
            cy.wait(4000)

            //Получаем открытый ЛС
            personalAccount.getActivePersonalAccount(personalAccountParam)
                .then((result) => {
                    //Проверяем, что операция на открытом ЛС есть
                    expect(result).not.be.empty
                    //Получаем операцию на открытом ЛС
                    personalAccount.getOperationsByPersonalAssountId(result[0].id)
                        .then((operations) => {
                            //Проверяем параметры операции
                            personalAccount.checkOperationParams(operations[0], operationParam)
                        })
                })
        })
    })
})