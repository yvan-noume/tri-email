/**
 * constructeur d'un contact
 * @param {Object} param0 
 */
var Contact = function({name, surname, email}) {
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.nbContactTime = 1;
}

/**
 * increment de 1 le nombre de fois où le contact est invoqué
 */
Contact.prototype.incrementNbContactTime = function () {
    this.nbContactTime++;
}

/**
 * regarder si deux contacts on le meme email
 * @param {string} email_contact 
 */
Contact.prototype.equals = function(email_contact) {
    return this.email === email_contact;
}

/**
 *  tranforme un contact en format VCARD
 */ 
Contact.prototype.toVcard = function()
{
  let vcardContact = 'BEGIN:VCARD\nVERSION:4.0\n';
  vcardContact += `N:${this.surname};${this.name};;;\n`;
  vcardContact += `FN:${this.name} ${this.surname}\n`;
  vcardContact += `EMAIL:${this.email}\n`;
  vcardContact += 'END:VCARD\n';
  return vcardContact;
}
module.exports = Contact;