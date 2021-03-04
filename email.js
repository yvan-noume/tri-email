const Contact = require("./contact");
const ContactList = require("./contactList");

/**
 * constructeur d'un email
 * @param {*} param0 
 */
var Email = function({mID, date, from, to, subject, cc, mimeVersion,
    contentType, contentTransferEncoding, bcc, xFrom, xTo, xcc, xbcc,
    xFolder, xOrigin, xFileName, content, originalFile}){
    this.messageID = mID;
    this.date = date;
    this.from = from;
    this.to = [].concat(to);
    this.subject = subject;
    this.cc = [].concat(cc);
    this.mimeVersion = mimeVersion;
    this.contentType = contentType;
    this.contentTransferEncoding = contentTransferEncoding;
    this.bcc = [].concat(bcc);
    this.xFrom = xFrom;
    this.xTo = [].concat(xTo);
    this.xcc = [].concat(xcc);
    this.xbcc = [].concat(xbcc);
    this.xFolder = xFolder;
    this.xOrigin = xOrigin;
    this.xFileName = xFileName;
    this.content = content;
    this.originalFile = originalFile;
}

/**
 * recuperer les contacts d'un email, to, cc, from
 */
Email.prototype.getContacts = function () {
    var contacts = new ContactList([]);
    if (this.to != []) {
        this.to.forEach(elem=>{
            var ctct = new Contact(this.toContact(elem));
            var res = contacts.exist(ctct);
            if (res == -1) {
                contacts.addContact(ctct);
            }
        });
    }
    if (this.cc != []) {
        this.cc.forEach(elem=>{
            var ctct = new Contact(this.toContact(elem));
            var res = contacts.exist(ctct);
            if (res == -1) {
                contacts.addContact(ctct);
            }
        });
    }
    if (this.bcc != []) {
        this.bcc.forEach(elem=>{
            var ctct = new Contact(this.toContact(elem));
            var res = contacts.exist(ctct);
            if (res == -1) {
                contacts.addContact(ctct);
            }
        });
    }
    return contacts.list;
}

/**
 * transforme une adresse email en contact
 * @param {*} email 
 */
Email.prototype.toContact = function (email) {
    var tokens = email.split('@');
    tokens = tokens[0].split('.');
    return {name: tokens[0], surname: tokens[1], email}
}

/**
 * regarde si un collaborateur est dans l'email
 * @param {*} collaborator 
 */
Email.prototype.checkCollab = function (collaborator) {
    if (collaborator.includes('@')) {
        if (this.from == collaborator) {
            return true;
        }
        if (this.to.length > 0) {
            if (this.to.includes(collaborator)) {
                return true;
            }
        }
        if (this.cc.length > 0) {
            if (this.cc.includes(collaborator)) {
                return true;
            }
        }   
        if (this.bcc.length > 0) {
            if (this.bcc.includes(collaborator)) {
                return true;
            }
        }
    } else {
        collaborator = collaborator.toLowerCase();
        if (this.xFrom.toLowerCase().includes(collaborator)) {
            return true;
        }
        if (this.xTo.length > 0) {
            if (this.xTo.includes(collaborator)) {
                return true;
            }
        }
        if (this.xcc.length > 0) {
            if (this.xcc.includes(collaborator)) {
                return true;
            }
        }   
        if (this.xbcc.length > 0) {
            if (this.xbcc.includes(collaborator)) {
                return true;
            }
        }
    }
    return false;
}

module.exports = Email;