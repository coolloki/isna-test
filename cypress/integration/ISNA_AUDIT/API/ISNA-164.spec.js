//Загружаем тело запроса из файла
import baseRequest from '../../../fixtures/ISNA_AUDIT/requests/create_notice.json'

//Загружаем тестовые данные
import testDataSource from '../../../fixtures/ISNA_AUDIT/tests_data/ISNA-164_test_data.json'

describe('ISNA-164. Проверка API запросов на создание извещений', () => {

    before(() => {
        //Очищаем таблицу с извещениями в БД
        cy.clearAuditTaxNotices()
        //Получаем регулярное выражение для номера извещений
        cy.getDocumentNumber('notice', 6205)
        //Получаем текущую дату в разных форматах
        cy.getTodayDate()
    })

    //Проходим по каждому объекту тестовых данных caseData
    testDataSource.forEach((caseData) => {

        it(`Создание Извещения для ${caseData.tp_reg.iinBin} с формой проверки "${caseData.de_audit_form.name.ru}" и вопросом проверки "${caseData.de_audit_question.name.ru}"`, function () {

            //Меняем в тело запроса соответсвенно данными из caseData
            baseRequest.auditFormId = caseData.de_audit_form.id
            baseRequest.auditQuestions[0].auditQuestionId = caseData.de_audit_question.id
            baseRequest.tpAddressId = caseData.tp_reg.tpAddressId
            baseRequest.tpRegId = caseData.tp_reg.id

            //Создаем объект запроса создания извещения
            const createNoticeRequest = {
                url: Cypress.env('AUDIT_API') + '/audit-notices',
                method: 'POST',
                body: baseRequest
            }

            //Отправляем запрос 
            cy.request(createNoticeRequest)
                .then((responseOfCreate) => {
                    //Затем запрашиваем Созданное извещение по id
                    cy.request(Cypress.env('AUDIT_API') + '/audit-notices/' + responseOfCreate.body.id)
                        .then((responseOfGetNotice) => {
                            expect(responseOfGetNotice.body.id).eq(responseOfCreate.body.id)
                            expect(responseOfGetNotice.body.taxCaseId).to.be.null
                            expect(responseOfGetNotice.body.noticeDocumentNumber).match(new RegExp(this.noticeNumber))
                            expect(responseOfGetNotice.body.createDate).eq(this.todayDateUs)
                            expect(responseOfGetNotice.body.status).eq('CREATED')
                            expect(responseOfGetNotice.body.taxPayer.iinBin).eq(caseData.tp_reg.iinBin)
                            expect(responseOfGetNotice.body.taxPayer.rnn).eq(caseData.tp_reg.rnn)
                            expect(responseOfGetNotice.body.taxPayer.name).eqls(caseData.tp_reg.tpName)
                            expect(responseOfGetNotice.body.tpRegId).eq(caseData.tp_reg.id)
                            expect(responseOfGetNotice.body.tpAddress.value.id).eq(caseData.tp_reg.tpAddressId)
                            expect(responseOfGetNotice.body.tpAddress.value.fullAddress).eqls(caseData.tp_reg.fullAddress)
                            expect(responseOfGetNotice.body.tpAddress.value.detailedAddress).eqls(caseData.tp_reg.detailedAddress)
                            expect(responseOfGetNotice.body.auditForm.value).eqls(caseData.de_audit_form)
                            expect(responseOfGetNotice.body.auditKind).eqls(caseData.de_audit_kind)
                            expect(responseOfGetNotice.body.auditQuestions[0].auditQuestion.value).eqls(caseData.de_audit_question)
                        })

                })
        })
    })
})
