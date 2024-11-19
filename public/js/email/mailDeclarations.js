
export const declarations = {
    mailSidebar: () => document.querySelector('mail-sidebar'),
    mailList: () => document.querySelector('custom-list-mail'),
    rightPopUp: () => document.querySelector('right-popup'),
    mainContainer: () => document.querySelector('main'),
    aside: () => document.querySelector('aside'),
    from_address: () => document.querySelector('#from-address'),
    to_address: () => document.querySelector('#to-address'),
    cc_address: () => document.querySelector('#cc-address'),
    mail_subject: () => document.querySelector('#mail-subject'),
    mail_content: () => document.querySelector('#mail-content'),
    sendMailBtn: () => document.querySelector('#sendMailBtn')
}