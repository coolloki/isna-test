import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-258_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'
import Date from '../../../fixtures/COMMON/Date'

describe("ISNA-258. Обработка Онлайн платежей (бюджет и не бюджет) c различными датами", () => {

    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {

            const payment = new Payment()
            const external_code = new Commons().generateUUID()
            const date = new Date()

            const paymentParam = caseData.payment

            paymentParam.external_code = external_code
            paymentParam.payDate = date.getbusinessDaysSubtractDate('YYYY-MM-DD', paymentParam.payDateCaseDate)
            paymentParam.docDate = date.getbusinessDaysSubtractDate('YYYY-MM-DD', paymentParam.docDateCaseDate)

            const paymentResult = caseData.result

            payment.sendPaymentToGTM(paymentParam)

            cy.wait(4000)

            //Если payDate > docDate или платеже отсувтует docDate, 
            //то ожидаем что данные будут браться из payDate
            if (paymentParam.payDateCaseDate > paymentParam.docDateCaseDate || paymentParam.docDateNotExist) {
                paymentResult.document_date =
                    paymentResult.receipt_date =
                    paymentResult.write_off_date = paymentParam.payDate

                paymentResult.d_document_date =
                    paymentResult.d_receipt_date =
                    paymentResult.d_write_off_date = date.getDatetoDateFormat(paymentParam.payDate)
            }
            // Если payDate < docDate, то document_date = docDate, receipt_date = write_off_date = payDate
            else {
                paymentResult.document_date = paymentParam.docDate
                paymentResult.d_document_date = date.getDatetoDateFormat(paymentParam.docDate)

                paymentResult.receipt_date =
                    paymentResult.write_off_date = paymentParam.payDate


                paymentResult.d_receipt_date =
                    paymentResult.d_write_off_date = date.getDatetoDateFormat(paymentParam.payDate)
            }

            payment.checkPaymentByExternalCode(external_code, paymentResult)
        })
    })
})
