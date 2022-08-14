describe('ISNA-31. Проверка формы Создания извещения ', () => {
    beforeEach(() => {
        cy.kcLogin(Cypress.env('users').admin.login, Cypress.env('users').admin.password)
        cy.getTodayDate()
    })
    

    it('ISNA-31', function () {
        cy.visit('/account/arm/audit/tax_audits/notification_journal')
        //1. Кликнуть на кнопку «Создать извещение»
        cy.contains('Создать извещение').click()

        //Открылась форма «ИЗВЕЩЕНИЕ О ПРОВЕДЕНИИ НАЛОГОВОЙ ПРОВЕРКИ».
        cy.get('.antd-pro-components-typography-title-index-title').should('have.text', 'ИЗВЕЩЕНИЕ О ПРОВЕДЕНИИ НАЛОГОВОЙ ПРОВЕРКИ')

        //В шапке формы указана Дата создания: Сегодняшнее число.
        cy.xpath('//*[text()="' + this.todayDateKz + '"]').should('be.visible')

        //В список "Вид проверки:" подставлено значение "По особому порядку на основе оценки степени риска", список недоступен для редактирования.
        cy.xpath('//*[@name="auditKindExtId"]').should('have.text', 'По особому порядку на основе оценки степени риска')

        //В самом внизу формы присутствует заполненные:
        //ОГД: 6205 УГД по Есильскому району ДГД по городу Нур-Султану
        cy.xpath('//*[text()="ОГД"]').should('be.visible')
        cy.xpath('//*[text()="6205"]').should('be.visible')
        cy.xpath('//*[text()="УГД по Есильскому району ДГД по городу Нур-Султану"]').should('be.visible')

        //Служащий: Джеки Сакенович
        cy.xpath('//*[text()="Служащий"]').should('be.visible')
        cy.xpath('//*[text()="Джеки Сакенович"]').should('be.visible')

        //Руководитель ОГД: Жанибеков Ермек Серикбаевич
        cy.xpath('//*[text()="Руководитель ОГД"]').should('be.visible')
        cy.xpath('//*[text()="Жанибеков Ермек Серикбаевич"]').should('be.visible')

        //Присутвуют кнопки:
        //Сохранить
        cy.xpath('//button[normalize-space()="Сохранить"]').should('be.visible')

        //На утверждение
        cy.xpath('//button[normalize-space()="На утверждение"]').should('be.visible')

        //Закрыть
        cy.xpath('//button[normalize-space()="Закрыть"]').should('be.visible')
    
        //2. Кликнуть по кнопке "Закрыть"
        cy.xpath('//button[normalize-space()="Закрыть"]').click()
        //Открылся журнал "Журнал извещений о проведении налоговой проверки"
        cy.url().should('include', '/account/arm/audit/tax_audits/notification_journal')
    })

})