import Commons from '../../COMMON/Commons'

class PersonalAccount {

    /**Получить Активный ЛС по ИИН, КБК, и Кода ОГД
     * @param { Object } personalAccountParam 
     * @param { string } personalAccountParam.iin_bin
     * @param { string } personalAccountParam.kbk
     * @param { string } personalAccountParam.tax_org_code 
     */
    getActivePersonalAccount(personalAccountParam) {

        const code_nk = personalAccountParam.tax_org_code.substring(0, 4)
        const code_ptk = personalAccountParam.tax_org_code.slice(4)

        const sqlScript = `select rpa.* from ri_pers_account rpa 
        join de_tax_org dto on rpa.de_tax_org_id = dto.id 
        join de_kbk dk on rpa.de_kbk_id = dk.id
        join re_tax_payer rtp on rpa.re_tax_payer_id = rtp.id 
        where rtp.iin_bin = '` + personalAccountParam.iin_bin + `'
        and dk.code = '` + personalAccountParam.kbk + `'
        and dto.code_nk = '` + code_nk + `'
        and dto.code_tpk = '` + code_ptk + `'
        and rpa.close_date is null;`

        return cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: sqlScript }, { log: true })

    }

    /** Установить ЛС дату закрытия.  
     * @param { Object } personalAccountParam 
     * @param { string } personalAccountParam.iin_bin
     * @param { string } personalAccountParam.kbk
     * @param { string } personalAccountParam.tax_org_code 
     */
    setCloseDateforPersonalAccount(personalAccountParam) {
        this.getActivePersonalAccount(personalAccountParam)
            .then((personalAccount) => {
                if (personalAccount[0]) {
                    const sqlScript = `update ri_pers_account 
                    set close_date = '` + new Commons().getTodayDate() + `'
                    where id = ` + personalAccount[0].id + `;`

                    cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: sqlScript }, { log: true })
                }
            })
    }

    /** Получить операции на ЛС  
     * @param { string } personalAccountId
     */
    getOperationsByPersonalAssountId(personalAccountId) {

        const sqlScript = `select * from ri_pers_account_operation 
                where ri_pers_account_id = ` + personalAccountId + `;`

        return cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: sqlScript }, { log: true })
    }

    #checkOperationParam(operation, param, paramValue) {
        expect(operation[param]).eq(paramValue, "Проверка " + param)
    }

    /**
     * Проверка операции на ЛС
     * @param {Object} operation 
     * @param {Object} parametrs Проверяемые параметры
     */
    checkOperationParams(operation, parametrs) {
        Object.entries(parametrs)
            .map(([param, paramValue]) => {
                this.#checkOperationParam(operation, param, paramValue)
            })
    }
}
export default PersonalAccount