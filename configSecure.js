module.exports = {
    registrar: {
        account: 'lex',
        referer: 'cyberfounder',
        fee: '1.000 GOLOS',
        signing_key: '5JFZC7AtEe1wF2ce6vPAUxDeevzYkPgmtR14z9ZVgvCCtrFAaLw',
        delegation: '33060.000000 GESTS',
        email_sender: 'registrator@golostalks.com',
        // email_subject and email_html can contain one of forum titles, example: {FORUM.logo_title}
        // email_html should contain verification code: {verification_code}
        ru: {
          email_subject: 'Подтвердите регистрацию на {FORUM.logo_title}',
          email_html: 'Ваш код подтверждения: <h4>{verification_code}</h4>'
        },
        en: {
          email_subject: 'Verify FORUM.logo_title sign up',
          email_html: 'Your verification code: <h4>{verification_code}</h4>'
        }
    },
    gmail_send: {
        user: 'halfyearforwhat@gmail.com',
        pass: 'yforlmawttbbczrv',
    }
};
