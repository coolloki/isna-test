const dict = require('../dictionaries/NoticeJournalDict.json')

class NoticesJournal {
    constructor(translation) {
        if(translation=='ru' || !translation ) {
            this.translation = dict.ru
            this.locale = 'ru'
        }
    }

    getJournalUrl() {
        return '/account/arm/audit/tax_audits/notification_journal'
    }

    getCreateNoticeButton() {
        return cy.xpath('//button[normalize-space()="' + this.translation.createNoticeButton +'"]')
    }
    
    checkCreateNotification() {
        cy.xpath('//*[@class[contains(., "ant-notification-topRight")] and normalize-space()="'+ this.translation.notifications.noticeCreate + '"]').should('be.visible')
    }
    checkApprovalNotification() {
        cy.xpath('//*[@class[contains(., "ant-notification-topRight")] and normalize-space()="'+ this.translation.notifications.noticeApproval + '"]').should('be.visible')
    }

    checkNoticeIin(iin) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[3])[1]').should('have.text', iin)
    }

    checkNoticeRnn(rnn) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[2])[1]').should('have.text', rnn)
    }

    checkNoticeDocumentNumber(noticeNumber) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[4])[1]').contains(new RegExp(noticeNumber))
    }

    checkNoticeCreateDate(todayDate) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[5])[1]').should('have.text', todayDate)
    }

    checkNoticeStatus(status) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[8])[1]').should('have.text', this.translation.status[status])
    }

    checkNoticeKpnStatus(status) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[9])[1]').should('have.text', this.translation.noticeKnpStatus[status])
    }

    checkNpUEO(check) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[10])[1]').should('have.text', this.translation.UEO[check])
    }

    checkNoticeNpName(name) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[11])[1]').should('have.text', name)
    }

    checkNoticeOgd(name) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[12])[1]').should('have.text', name)
    }

    checkNoticeCreator(name) {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[13])[1]').should('have.text', name)
    }

    checkNoticeAuditFormById(id)  {
        cy.xpath('(//*[@class="ant-table-row ant-table-row-level-0"]//td[14])[1]').should('have.text', this.translation.auditForm[id])
    }

    getNoticeAction(action) {
        cy.xpath('(//a[normalize-space()="..."])[1]').click()
        cy.xpath('//*[@role="menu"]//*[normalize-space(text())="' + this.translation.actions[action] + '"]').click()
    }

    clickSortByTitleName(titleName, times) {
        for(let i =0; i < times; i++ ){
            cy.xpath('//*[@class="ant-table-column-sorters" and normalize-space()="' + this.translation.tableTitles[titleName]+ '"]//*[@aria-label="caret-down"]').click({force: true})
        }
    }

    checkHistoryPopup() {
        cy.xpath('//*[@class="ant-modal-content" and .//*[normalize-space()="' + this.translation.historyPopup.title + '"]]').should('be.visible')
    }

    checkHistoryEvent(event, eventIndex, todayDate) {
        const history = {
            "saved": {
                "events": this.translation.events.noticeCeated,
                "status": this.translation.status.created,
                "noticeKnpStatus": this.translation.noticeKnpStatus.not_sent
            },
            "sentToApproval": {
                "events": this.translation.events.noticeSentToApproval,
                "status": this.translation.status.sentToApproval,
                "noticeKnpStatus": this.translation.noticeKnpStatus.not_sent
            }
        }
        //№
        cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[1][normalize-space()="' + eventIndex +'"]').should('be.visible')
        //Событие
        cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[2][normalize-space()="' + history[event].events + '"]').should('be.visible')
        //«Статус»
        cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[3][normalize-space()="' + history[event].status + '"]').should('be.visible')
        //«Статус отправки в КНП» 
        //cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[4][normalize-space()="' + history[event].noticeKnpStatus + '"]').should('be.visible')
        //«Дата» - ДД-ММ-ГГГГ чч:мм:сс,
        cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[5]')
        .contains(new RegExp(todayDate + ` \\d{2}:\\d{2}:\\d{2}`))
        //«Служащий» - Должность, Имя Фамилия, ОГД,
        cy.xpath('(//*[@id="NotificationJournalHistory"]//*[@class[contains(., "ant-table-row-level-0")]])['+ eventIndex +']//td[6]')
        .should('contain', this.translation.employee.position)
        .and('contain', this.translation.employee.name)
        .and('contain', this.translation.employee.taxCode)
        .and('contain', this.translation.employee.taxName)
    }
    
    checkHistoryEvents(eventArray, todayDate) {
        eventArray.map((event, index) => {
            this.checkHistoryEvent(event, index + 1, todayDate)
        })
    }


    clickPrintHistory() {
        cy.xpath('//*[@class="ant-modal-content"]//button[normalize-space()="' + this.translation.buttons.print + '"]').click()
    }

}
export default NoticesJournal