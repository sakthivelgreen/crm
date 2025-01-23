export const keyMap = {
    name: (key) => `${key['first-name']} ${key['last-name']}`,
    mail: (key) => key['email'],
    email: (key) => key['email'],
    phone: (key) => key['phone'],
    designation: (key) => key['designation'],
    product: (key) => key['product'],
    deal_Name: (key) => key['dealname'],
    deal_Pipeline: (key) => key['dealpipeline'],
    deal_Stage: (key) => key['dealstage'],
    deal_Amount: (key) => key['dealamount'],
    deal_Owner: (key) => key['dealowner'],
    deal_Contact: (key) => key['dealcontact'],
    deal_Account: (key) => key['dealaccount'],
    account_Name: (key) => key['organisation_name'],
    account_Phone: (key) => key['organisation_phone'],
    account_Email: (key) => key['organisation_email'],
    account_Income: (key) => key['organisation_income'],
    meeting_topic: (key) => key['topic'],
    meeting_Agenda: (key) => key['agenda'],
    start_Date: (key) => key['startDate'],
    Subject: (key) => key['subject'],
    Date: (key) => key['receivedTime'],
    Summary: (key) => key['summary']
}
export const LeadMap = {
    'First Name': (key) => `${key['first-name']}`,
    'Last Name': (key) => `${key['last-name']}`,
    'Email': (key) => `${key['email']}`,
    'Phone': (key) => `${key['phone']}`,
    'Date Created': (key) => `${key['date-created']}`,
    'Lead Owner': (key) => `${key['lead-owner']}`,
    'Lead Source': (key) => `${key['lead-source']}`,
    'Title': (key) => `${key['title']}`,
    'Fax': (key) => `${key['fax']}`,
    'Website': (key) => `${key['website']}`,
    'Employee Count': (key) => `${key['employee-count']}`,
    'Product': (key) => `${key['product']}`,
    'City': (key) => `${key['city']}`,
    'State': (key) => `${key['state']}`,
    'Country': (key) => `${key['country']}`,
    'Pin Code': (key) => `${key['pin-code']}`,
    'Postal Code': (key) => `${key['pin-code']}`,
}
export const ContactMap = {}
export const OrgMap = {
    'Organisation': (key) => `${key['org-name']}`,
    'Organization': (key) => `${key['org-name']}`,
    'Name': (key) => `${key['org-name']}`,
    'Revenue': (key) => `${key['org-income']}`,
    'Income': (key) => `${key['org-income']}`,
    'Designation': (key) => `${key['designation']}`,
    'Role': (key) => `${key['designation']}`,
    'Phone': (key) => `${key['org-phone']}`,
    'Website': (key) => `${key['org-website']}`,
    'City': (key) => `${key['org-city']}`,
    'State': (key) => `${key['org-state']}`,
    'Country': (key) => `${key['org-country']}`,
    'Pin Code': (key) => `${key['org-pin-code']}`,
    'Postal Code': (key) => `${key['org-pin-code']}`,
}
export const DealMap = {}