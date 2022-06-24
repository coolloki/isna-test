// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const dayjs = require('dayjs')

Cypress.Commands.add('kcLogin', (username, password) => {

  cy.visit('/user/login')
  cy.origin(
    "https://keycloak-isna.sapasoft.kz",
    { args: [username, password] },
    ([username, password]) => {
      const kcRoot = 'https://keycloak-isna.sapasoft.kz'
      const kcRealm = 'jhipster'
      const kcClient = 'web_app'
      const kcRedirectUri = Cypress.config().baseUrl + '/user/home'
      const loginPageRequest = {
        url: `${kcRoot}/auth/realms/${kcRealm}/protocol/openid-connect/auth`,
        qs: {
          client_id: kcClient,
          redirect_uri: kcRedirectUri,
          state: createUUID(),
          nonce: createUUID(),
          locales_ui: 'ru',
          response_type: 'code token',
          scope: 'openid profile email'
        }
      }

      cy.request(loginPageRequest)
        .then(submitLoginFormLogin)
        .then(submitLoginFormPass)

      function createUUID() {
        var s = []
        var hexDigits = '0123456789abcdef'
        for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = '4'
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
        s[8] = s[13] = s[18] = s[23] = '-'
        var uuid = s.join('')
        return uuid
      }

      function submitLoginFormLogin(response) {
        const _el = document.createElement('html')
        _el.innerHTML = response.body

        const loginForm = _el.getElementsByTagName('form')
        const isAlreadyLoggedIn = !loginForm.length
        if (isAlreadyLoggedIn) {
          cy.url().should('contain', Cypress.config().baseUrl + '/account/home')
          return
        }
        const newUrl = loginForm[0].action.replace('http://', 'https://')
        return cy.request({
          form: true,
          method: 'POST',
          url: newUrl,
          followRedirect: true,
          body: {
            username: username,
            SignedXml: '',
            loginMode: 'LOGIN',
            isnaProfile: 'DEV'
          }
        })
      }

      function submitLoginFormPass(response) {
        const _el = document.createElement('html')
        _el.innerHTML = response.body

        const loginForm = _el.getElementsByTagName('form')
        const isAlreadyLoggedIn = !loginForm.length
        if (isAlreadyLoggedIn) {
          return
        }
        const newUrl = loginForm[0].action.replace('http://', 'https://')

        cy.request({
          form: true,
          method: 'POST',
          url: newUrl,
          followRedirect: false,
          body: {
            password: password,
            login: 'Войти'
          }
        })

      }

    })

  cy.reload()
  cy.url().should('contain', '/account/home')

})

Cypress.Commands.add('kcLogout', () => {
  const kcRoot = 'https://keycloak-isna.sapasoft.kz';
  const kcRealm = 'jhipster';
  const kcRedirectUri = Cypress.config().baseUrl + '/user/login';
  cy.request({
    method: 'GET',
    followRedirect: false,
    url: `${kcRoot}/auth/realms/${kcRealm}/protocol/openid-connect/logout`,
    qs: {
      redirect_uri: kcRedirectUri
    },
    headers: {
      "Refer": Cypress.config().baseUrl
    }
  })
})

Cypress.Commands.add('clearAuditTaxNotices', () => {
  cy.task('DATABASE', { dbConfig: Cypress.env('DB').AUDIT, sql: 'truncate ri_audit_notice cascade' }, { log: false })
})

Cypress.Commands.add('getPaymentByExternlCode', (externalCode) => {
  cy.task('DATABASE', { dbConfig: Cypress.env('DB').LS, sql: `select * from ri_payment where external_code='`+ externalCode + `';` }, { log: false })
})

Cypress.Commands.add('getDocumentNumber', (documentType, taxCode) => {
  return cy.wrap(getDocumentNumber(documentType, taxCode)).as(documentType + 'Number')
})

function getDocumentNumber(documentType, taxCode) {
  const documentPrefix = getDocumentPrefix(documentType)
  const todaysDateforDocument = dayjs().format('YYYYMMDD')
  const documentNumber = `${taxCode}${todaysDateforDocument}${documentPrefix}\\d{4}`
  return documentNumber
}

function getDocumentPrefix(documentType) {
  if (documentType === 'notice') {
    const documentPrefix = 'TAN'
    return documentPrefix
  }
}

Cypress.Commands.add('getTodayDate', (format) => {
  cy.wrap(dayjs().format('DD.MM.YYYY')).as('todayDateKz')
  cy.wrap(dayjs().format('YYYY-MM-DD')).as('todayDateUs')
})

Cypress.Commands.add('getTranslation', () => {
  if (!Cypress.env('LOCALE') || Cypress.env('LOCALE') == 'ru' || Cypress.env('LOCALE') == 'Ru') {
    cy.wrap('ru').as('translation')
    return
  }
  cy.wrap(Cypress.env('LOCALE')).as('translation')
  return
})