const requiredScope = [
    'ZohoMeeting.meeting.ALL',
    'ZohoMeeting.manageOrg.READ',
    'ZohoMail.folders.ALL',
    'ZohoMail.messages.ALL',
    'ZohoMail.organization.accounts.ALL',
    'ZohoMail.partner.organization.ALL',
    'ZohoMail.accounts.ALL'
].join(',');
module.exports = requiredScope;