import NoticeJournal from '../../../fixtures/ISNA_AUDIT/page_objects/NoticeJournal'
import baseRequest from '../../../fixtures/ISNA_AUDIT/requests/create_notice.json'

describe('ISNA-222 : Просмотр истории извещения в статусе "На утверждении"', () => {
    beforeEach(() => {
        //Меняем запрос для отправки на утверждение
        baseRequest.action = 'PROCESS'
        //Создаем объект запроса создания извещения
        const createNoticeRequest = {
            url: Cypress.env('AUDIT_API') + '/audit-notices',
            method: 'POST',
            body: baseRequest
        }

        cy.clearAuditTaxNotices()
        cy.request(createNoticeRequest)
        cy.getTodayDate()
    })

    it('ISNA-222 : Просмотр истории извещения в статусе "На утверждении"', function () {
        const noticeJournal = new NoticeJournal(this.translation)

        cy.kcLogin(Cypress.env('users').admin.login, Cypress.env('users').admin.password)
        cy.visit(noticeJournal.getJournalUrl())
        //1. Кликнуть по кнопке "..." у созданного извещения
        //Кликнуть по пункту "История"
        noticeJournal.getNoticeAction('history')

        //Открылось окно "ИСТОРИЯ ИЗМЕНЕНИЯ СТАТУСА ИЗВЕЩЕНИЯ О ПРОВЕДЕНИИ НАЛОГОВОЙ ПРОВЕРКИ"
        noticeJournal.checkHistoryPopup()
        //В истории изменения статуса извещения есть запись с полями:

        //«№» - 1,
        //«Событие» - Извещение создано,
        //«Статус» - Создано,
        //«Статус отправки в КНП» - Не отправлен,
        //«Дата» - ДД-ММ-ГГГГ чч:мм:сс,
        //«Служащий» - Должность, Имя Фамилия, ОГД,
        //«Дополнительная информация» - пусто

        /*«№» - 2,
        «Событие» - Извещение создано,
        «Статус» - На утверждении,
        «Статус отправки в КНП» - Не отправлено,
        «Дата» - ДД.ММ.ГГГГ чч:мм:сс,
        «Служащий» - Должность, Имя Фамилия, ОГД,
        «Дополнительная информация» - пусто */
        noticeJournal.checkHistoryEvents(['saved', 'sentToApproval'], this.todayDateKz)

        cy.window().then(win => {
            cy.stub(win, 'open').as('printForm')
        })
        //Кликнуть по кнопке "Печать"
        noticeJournal.clickPrintHistory()
        //В новой вкладке открывается печатная форма истории извещения
        cy.get('@printForm').should("be.called")

    })

})