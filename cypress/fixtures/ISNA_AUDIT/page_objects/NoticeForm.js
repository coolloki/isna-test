const dict = require('../dictionaries/NoticeFormDict.json')

class NoticeForm {
    constructor(translation) {
        if(translation=='ru' || !translation ) {
            this.translation = dict.ru
            this.locale = 'ru'
        }
    }

    getCreateUrl() {
        return '/account/arm/audit/multi-form?form=notice&id=null&action=create&status=undefined'
    }

    getTitle() {
            return cy.get('h1')
    }

    getNumberLabel(){
        return cy.xpath('//*[normalize-space()="'+ this.translation.noticeNumberLabel +'"]')
    }

    getRnnInput() {
        return cy.xpath('//*[@class[contains(.,"ant-form-item")] and .//*[normalize-space()="'+ this.translation.npRnnLabel + '"]]//input')
    }

    getInnInput() {
        return cy.xpath('//*[@class[contains(.,"ant-form-item")] and .//*[normalize-space()="'+ this.translation.npInnLabel + '"]]//input')
    }

    checkNpFullNameValue(name) {
        cy.xpath('//*[@class[contains(.,"ant-form-item")] and .//*[normalize-space()="'+ this.translation.npNameLabel + '"]]//input').should('have.value', name)
    }

    checkFullUrAddress(address) {
        cy.xpath('//b[contains(normalize-space(),"'+ this.translation.npFullAddressLabel + '")]').should('contain.text', address)
    }

    setAuditFormById(id) {
        cy.xpath('//*[@class[contains(.,"formikWrapperDiv ")] and .//*[normalize-space()="'+ this.translation.auditForm.label + '"]]//input').click()
        cy.xpath('//*[@class[contains(., "ant-select-item-option-content")] and normalize-space()="'+ this.translation.auditForm[id] + '"]').click()
    }

    checkAuditFormById(id) {
        cy.xpath('//*[@class[contains(., "ant-select-item-option-selected")] and normalize-space()="'+ this.translation.auditForm[id] + '"]').should('be.visible')
    }

    setAuditQuestionById(id) {
        cy.xpath('//*[@class[contains(.,"formikWrapperDiv ")] and .//*[normalize-space()="'+ this.translation.auditQuestion.label + '"]]//input').click()
        if(id>8 && id!=13) {
            cy.xpath('//*[@class[contains(., "ant-select-item-option-content")] and normalize-space()="'+ this.translation.auditQuestion[8] + '"]').trigger('mouseover')    
        }
        cy.xpath('//*[@class[contains(., "ant-select-item-option-content")] and normalize-space()="'+ this.translation.auditQuestion[id] + '"]').click()
    }

    checkAuditQuestionById(id) {
        cy.xpath('//*[@class[contains(., "ant-select-item-option-selected")] and normalize-space()="'+ this.translation.auditQuestion[id] + '"]').should('be.visible')
    }
   
    clickBySaveButton() {
        cy.xpath('//button[normalize-space()="'+ this.translation.saveButton + '"]').click()
    }

    clickBySentToApprovalButton() {
        cy.xpath('//button[normalize-space()="'+ this.translation.sentToApprovalButton + '"]').click()
    }

    checkConfirmationSavePopup() {
        cy.xpath('//*[@class="ant-modal-content" and .//*[normalize-space()="'+ this.translation.saveConfirmationPopup.label + '"]]').should('be.visible')
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.saveConfirmationPopup.no + '"]').should('be.visible')
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.saveConfirmationPopup.yes +'"]').should('be.visible')
    }

    checkConfirmationApprovePopup() {
        cy.xpath('//*[@class="ant-modal-content" and .//*[normalize-space()="'+ this.translation.approvalConfirmationPopup.label + '"]]').should('be.visible')
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.approvalConfirmationPopup.no + '"]').should('be.visible')
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.approvalConfirmationPopup.yes +'"]').should('be.visible')
    }

    confirmSave(decision) {
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.saveConfirmationPopup[decision] + '"]').click()
    }

    confirmApproval(decision) {
        cy.xpath('//*[@class[contains(., "ant-modal-body")]]//button[normalize-space()="'+ this.translation.approvalConfirmationPopup[decision] + '"]').click()
    }

    checkNoticeDetailedAddress(address) {
        cy.get('.ant-table-wrapper').should('be.visible')
        cy.xpath('(//*[@class="ant-table-cell"])[9]').should('have.text', address.arCode)
        cy.xpath('(//*[@class="ant-table-cell"])[10]').should('have.text', address.postalCode)
        cy.xpath('(//*[@class="ant-table-cell"])[11]').should('have.text', address.region[this.locale])
        cy.xpath('(//*[@class="ant-table-cell"])[12]').should('have.text', address.city[this.locale])
        cy.xpath('(//*[@class="ant-table-cell"])[13]').should('have.text', address.village[this.locale])
        cy.xpath('(//*[@class="ant-table-cell"])[14]').should('have.text', address.street[this.locale])
        cy.xpath('(//*[@class="ant-table-cell"])[15]').should('have.text', address.house[this.locale])
        cy.xpath('(//*[@class="ant-table-cell"])[16]').should('have.text', address.apartment[this.locale])
    }

    choiseTaxPayerType(type) {
        cy.xpath('//*[@class[contains(., "ant-table-row")] and .//*[normalize-space()="' + this.translation.choiseTaxPayerType[type] + '"]]//input').click()
        cy.xpath('//button[normalize-space()="OK"]').click()
    }
}
export default NoticeForm