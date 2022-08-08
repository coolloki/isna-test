import Payment from '../../../fixtures/ISNA_LS/objects/Payment'
import testDataSource from '../../../fixtures/ISNA_LS/tests_data/ISNA-258_test_data.json'
import Commons from '../../../fixtures/COMMON/Commons'
import Date from '../../../fixtures/COMMON/Date'

const payment = new Payment()
const date = new Date()

testDataSource.forEach(iteration =>{
    const external_code = new Commons().generateUUID()
    iteration.payment.external_code = external_code
})


describe("ISNA-258. Обработка Онлайн платежей (бюджет и не бюджет) c различными датами", function() {
    before(function() {
        testDataSource.forEach(caseData =>{

            const paymentParam = caseData.payment
            paymentParam.payDate = date.getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.payDateCaseDate)
            paymentParam.docDate = date.getDateSubtractBusinessDays('YYYY-MM-DD', paymentParam.docDateCaseDate)
            payment.sendPaymentToGTM(paymentParam)
        })
        cy.wait(4500)
    })
 
        
    testDataSource.forEach(caseData => {
        it(caseData.testTittle, function () {
            
            const paymentResult = caseData.result
            const paymentParam = caseData.payment

            //Если payDate > docDate или платеже отсувтует docDate, 
            //то ожидаем что данные будут браться из payDate
            if (paymentParam.payDateCaseDate > paymentParam.docDateCaseDate || paymentParam.docDateNotExist) {
                paymentResult.document_date = paymentResult.receipt_date = paymentResult.write_off_date = paymentParam.payDate
                paymentResult.d_document_date = paymentResult.d_receipt_date = paymentResult.d_write_off_date = date.getDatetoDateFormat(paymentParam.payDate)
            }
            // Если payDate < docDate, то document_date = docDate, receipt_date = write_off_date = payDate
            else {
                paymentResult.document_date = paymentParam.docDate
                paymentResult.d_document_date = date.getDatetoDateFormat(paymentParam.docDate)

                paymentResult.receipt_date = paymentResult.write_off_date = paymentParam.payDate
                paymentResult.d_receipt_date = paymentResult.d_write_off_date = date.getDatetoDateFormat(paymentParam.payDate)
            }

            payment.checkPaymentByExternalCode(paymentParam.external_code, paymentResult)
        })
    })
})
