/**
 * contructeur d'une liste de contact
 * @param {Contact[]} contacts 
 */
var ContactList = function(contacts) {
    this.list = contacts;
    this.size = 0;
}

/**
 * ajoute un contact à la liste
 * @param {*} contact 
 */
ContactList.prototype.addContact = function(contact) {
    this.size = this.list.push(contact);
}

/**
 * ajoute des contacts à la liste
 * @param {Contact} contacts 
 */
ContactList.prototype.addContacts = function(contacts) {
    this.list = this.list.concat(contacts);
    this.size += contacts.length;
}

/**
 * spec 7 permet de trouver les 10 personnes avec qui notre interlocuteur communique souvent
 */
ContactList.prototype.findTop10Collab = function() {
    var changed;
    do{
        changed = false;
        for(var i=0; i < this.list.length-1; i++) {
            if(this.list[i].nbContactTime < this.list[i+1].nbContactTime) {
                var tmp = this.list[i];
                this.list[i] = this.list[i+1];
                this.list[i+1] = tmp;
                changed = true;
            }
        }
    } while(changed);
    return this.list.slice(0,10);
}

/**
 * fonction d'une liste de contact pour savoir si un contact exite déjà dans la liste
 * @param {Contact} contact 
 */
ContactList.prototype.exist = function(contact) {
    var rtn = -1;
    var index = 0;
    this.list.forEach(element => {
        if (contact.equals(element.email)) {
            rtn = index;
            return;
        }
        index++;
    });
    return rtn;
}

/**
 * fonction d'une liste de contact pour avoir les collaborateurs d'un interlocuteur (spec8)
 * @param {string} collaborator 
 */
ContactList.prototype.getJSONData = function(collaborator) {
    var objs = [];
    this.list.forEach(function(element) {
        if (element.nbContactTime > 0) {
            objs.push({collab1 : collaborator, collab2 : element.email, nbContactTime:element.nbContactTime});
        }
    });
    return objs;
}

module.exports = ContactList;