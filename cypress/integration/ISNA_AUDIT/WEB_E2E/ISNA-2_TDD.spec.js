import NoticeForm from '../../../fixtures/ISNA_AUDIT/page_objects/NoticeForm'
import NoticeJournal from '../../../fixtures/ISNA_AUDIT/page_objects/NoticeJournal'

import testDataSource from '../../../fixtures/ISNA_AUDIT/tests_data/ISNA-164_test_data.json'

describe('ISNA-2_TDD. Тестирование созданий извещений, с постусловием 2', () => {
    before(() => {
        cy.getDocumentNumber('notice', 6205)
        cy.getTodayDate()
        cy.getTranslation()
    })

    testDataSource.forEach((caseData) => {
        it(`Создание Извещения для ${caseData.tp_reg.iinBin} с формой проверки "${caseData.de_audit_form.name.ru}" и вопросом проверки "${caseData.de_audit_question.name.ru}"`, function () {
            cy.clearAuditTaxNotices()
            cy.kcLogin(Cypress.env('users').admin.login, Cypress.env('users').admin.password)
            
            const noticeForm = new NoticeForm(this.translation)
            const noticeJournal = new NoticeJournal(this.translation)

            //В тестовых данных null менятеся на ''
            const thisCaseData = JSON.parse(JSON.stringify(caseData).replace(/\:null/gi, "\:\"\""))

            cy.visit(noticeForm.getCreateUrl())
            cy.url().should('include', noticeForm.getCreateUrl())

             //1. В поле «РНН:» ввести 600900687596
            noticeForm.getInnInput().type(thisCaseData.tp_reg.iinBin)

            //Если у НП будет два типа рег. учета, будут выполнятся дополнительное действие по выбору определенного рег. учета
            if(thisCaseData.tp_reg.iinBin === '915661024988'){
                noticeForm.choiseTaxPayerType(thisCaseData.tp_reg.tpType)
            }
            
            //Данные введены в поле.
            noticeForm.getRnnInput().should('have.value', thisCaseData.tp_reg.rnn)
            //В форме заполнены:
            //ИИН/БИН: 140950029062
            noticeForm.getInnInput().should('have.value', thisCaseData.tp_reg.iinBin)
            //ФИО/Наименование: "Акционерное общество "ARCUS"
            noticeForm.checkNpFullNameValue(thisCaseData.tp_reg.tpName[this.translation])
            //Адрес налогоплательщика (юридический): 1111222233334444, Z10H9B8, Нур-Султан, Сарыарка, 4, 45
            noticeForm.checkFullUrAddress(thisCaseData.tp_reg.fullAddress[this.translation])
            //В таблице с адресом заполнены:
            noticeForm.checkNoticeDetailedAddress(thisCaseData.tp_reg.detailedAddress)

            //2. Кликнуть по полю «Форма проверки:» и выбрать «Тематическая проверка»
            noticeForm.setAuditFormById(thisCaseData.de_audit_form.id)

            //«Тематическая проверка» вписана в поле.
            noticeForm.checkAuditFormById(thisCaseData.de_audit_form.id)

            //3. Кликнуть по полю «Вопросы проверки»
            //Появился список с вопросами проверок
            noticeForm.setAuditQuestionById(thisCaseData.de_audit_question.id)

            //4. Кликнуть по одному из вопросов
            //Вопрос подставился в поле «Вопросы проверки:» с кнопкой крестиком
            noticeForm.checkAuditQuestionById(thisCaseData.de_audit_question.id)
            cy.get('.antd-pro-components-tag-tag-closeIcon').should('be.visible')

            //5. Кликнуть за пределы списка и кликнуть по кнопке «На утверждение»
            noticeForm.getTitle().click()
            noticeForm.clickBySentToApprovalButton()

            //Появилось модальное окно «Сохранить данные извещения?» с кнопками «Нет» «Да»
            noticeForm.checkConfirmationApprovePopup()

            //Кликнуть по кнопке «Да»
            noticeForm.confirmApproval('yes')

            //Произошёл переход в журнал.
            cy.url().should('include', noticeJournal.getJournalUrl())

            //Появилось уведомление «Данные сохранены».
            noticeJournal.checkApprovalNotification()

            //Кликаем два раза по сортеровке по номеру документа, что бы проверялось последнее соозданное извещение
            noticeJournal.clickSortByTitleName('noticeNumber', 2)
            //В журнале присутствует извещение. У извещения заполнены поля:
            //«РНН»
            noticeJournal.checkNoticeRnn(thisCaseData.tp_reg.rnn)
            //«ИИН/БИН»,
            noticeJournal.checkNoticeIin(thisCaseData.tp_reg.iinBin)

            //«Номер извещения» согласно постусловию,
            noticeJournal.checkNoticeDocumentNumber(this.noticeNumber)

            //«Дата создания»,
            noticeJournal.checkNoticeCreateDate(this.todayDateKz)

            //«Статус» - Создано,
            noticeJournal.checkNoticeStatus('sentToApproval')

            //«Статус в Кабинете НП» - Не отправлен,
            //////////noticeJournal.checkNoticeKpnStatus('NOT_SENT')

            //«УЭО» - Да,
            noticeJournal.checkNpUEO('yes')

            //«Наименование налогоплательщика»,
            noticeJournal.checkNoticeNpName(thisCaseData.tp_reg.tpName[this.translation])

            //«Орган государственных доходов»,
            noticeJournal.checkNoticeOgd('6205 УГД по Есильскому району ДГД по городу Нур-Султану')

            //«Служащий»,
            noticeJournal.checkNoticeCreator('Джеки Сакенович')

            //«Форма проверки».
            noticeJournal.checkNoticeAuditFormById(thisCaseData.de_audit_form.id)

        })
    })

})