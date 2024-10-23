export const keyMap = {
    name: (key) => `${key['firstname']} ${key['lastname']}`,
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
    deal_Account: (key) => key['dealaccount']
}