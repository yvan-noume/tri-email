var Email = require('./email');
var EmailList = require('./emailList');
const emailRegEx = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])/g;
const ContactList = require('./contactList');

// emailParser

var emailParser = function(sTokenize, sParsedSymb, collab){
	// The list of email parsed from the input file.
	this.parsedEmail = new EmailList([]);
    this.symb = ["Message-ID","Date","From","To","Subject","Mine-Version","Content-Type",
"Content-Transfer-Enconding","X-From","X-To","X-cc","X-bcc","X-Folder","X-Origin","X-FileName"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
	this.contacts = new ContactList([]);
	this.collaborator = collab
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
emailParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: )/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
emailParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.email(tData, data);
}

// Parser operand

emailParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	// console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
emailParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
emailParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
emailParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
emailParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// Parser rules

emailParser.prototype.email = function(input, data){

	if(this.check("Message-ID", input)){
		var args = this.format(input, data);
		var e = new Email(args);
		if (this.collaborator != undefined) {
			if (!e.checkCollab(this.collaborator)) {
				return true;
			}
		}
		this.parsedEmail.addEmail(e);
		if (this.contacts.list.length != 0) {
			var aAjouter = e.getContacts();
			aAjouter.forEach(element => {
				var res = this.contacts.exist(element);
				if (res == -1) {
					this.contacts.addContact(element);
				} else {
					this.contacts.list[res].incrementNbContactTime();
				}
			});
		} else {
			this.contacts.addContacts(e.getContacts());
		}
		return true;
}
	return false;

}

// <format> = <id> <date> <sender> <destinataire> <sujet> <mime> <type_contenu> <encondage_contenu> <X> <contenu>
emailParser.prototype.format = function(input, data){
	var mID = this.id(input);
	var date = this.date(input);
	var from = this.from(input);
	if (input[0] === "To") {
		var to = this.to(input);
	} else {
		var to = [];
	}
	var subject = this.subject(input);
	if (input[0] === "Cc") {
		var cc = this.cc(input)
	} else {
		var cc = [];
	}
	var mimeVersion = this.mimeVersion(input);
	var contentType = this.contenttype(input);
	var contentTransferEncoding = this.contenttransferencoding(input);
	if (input[0] === "Bcc") {
		var bcc = this.bcc(input)
	} else {
		var bcc = [];
	}
	var xFrom = this.xfrom(input);
	var xTo = this.xTo(input);
	var xcc = this.xcc(input);
	var xbcc = this.xbcc(input)
	var xFolder = this.xFolder(input);
	var xOrigin = this.xOrigin(input);
	var xFileName = this.xFileName(input);
	var content = this.content(input);
	return {mID, date, from, to, subject, cc, mimeVersion, contentType, contentTransferEncoding, bcc, xFrom, xTo, xcc, xbcc, xFolder, xOrigin,
	xFileName, content, originalFile : data};
}

// id du mail
emailParser.prototype.id = function(input){
	this.expect("Message-ID",input)
	var curS = this.next(input);
	if(matched = curS.match(/(<\d+\.\d+\.(\w*|\.)+@(\w*|\.)+>)/g)){
		return matched[0];
	}else{
		this.errMsg("Invalid id", input);
	}
}

// date du mail
emailParser.prototype.date = function(input){
	this.expect("Date",input)
	var curS = this.next(input);
	if(matched = curS.match(/(\w{3}, \d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2} -\d{4} \(\w{3}\))/g)){
		return new Date(matched[0]);
	}else{
		this.errMsg("Invalid date", input);
	}
}

// expediteur du mail
emailParser.prototype.from = function(input){
	this.expect("From",input)
	var curS = this.next(input);
	if(matched = curS.match(emailRegEx)){
		return matched[0];
	}else{
		this.errMsg("Invalid from", input);
	}
}

// receveur(s) du mail
emailParser.prototype.to = function(input){
	this.expect("To",input)
	var curS = this.next(input);
	if(matched = curS.match(emailRegEx)){
		var result = matched;
		while (input[0] !== 'Subject') {
			var tmp = this.next(input);
			if (matched = tmp.match(emailRegEx)) {
				matched.forEach(element => {
					result.push(element.trim());
				});
			}
		}
		return result;
	}else{
		this.errMsg("Invalid to", input);
	}
}

// sujet du mail
emailParser.prototype.subject = function(input){
	var reg = /.+/g;
	this.expect("Subject",input);
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		var result = matched[0];
		var tmp;
		while (input[0] !== 'Cc' && input[0] !== 'Mime-Version') {
			tmp = this.next(input);
			if (matched = tmp.match(reg)) {
				result += '\n'+tmp;
			}
		}
		return result;
	}else{
		this.errMsg("Invalid subject", input);
	}
}

// copie du mail
emailParser.prototype.cc = function(input){
	this.expect("Cc",input);
	var curS = this.next(input);
	if(matched = curS.match(emailRegEx)){
		var result = matched;
		while (input[0] !== 'Mime-Version') {
			var tmp = this.next(input);
			if (matched = tmp.match(emailRegEx)) {
				matched.forEach(element => {
					result.push(element.trim());
				});
			}
		}
		return result;
	}else{
		this.errMsg("Invalid cc", input);
	}
}

// version du mail
emailParser.prototype.mimeVersion = function(input){
	var reg = /\d\.\d/g;
	this.expect("Mime-Version",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid mime version", input);
	}
}

// type de contenu du mail
emailParser.prototype.contenttype = function(input){
	var reg = /(text\/plain; charset=).*/g;
	this.expect("Content-Type",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid content type", input);
	}
}

// type d'encodage du mail
emailParser.prototype.contenttransferencoding = function(input){
	var reg = /.*/g;
	this.expect("Content-Transfer-Encoding",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid content transfer encoding", input);
	}
}

// copie cachée du mail
emailParser.prototype.bcc = function(input){
	this.expect("Bcc",input)
	var curS = this.next(input);
	if(matched = curS.match(emailRegEx)){
		var result = matched;
		while (input[0] !== 'X-From') {
			var tmp = this.next(input);
			if (matched = tmp.match(emailRegEx)) {
				matched.forEach(element => {
					result.push(element.trim());
				});
			}
		}
		return result;
	}else{
		this.errMsg("Invalid Bcc", input);
	}
}

// nom prénom de l'expediteur
emailParser.prototype.xfrom = function(input){
	var reg = /(.* .*)|([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]))/g;
	this.expect("X-From",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid xFrom", input);
	}
}

// nom prénom du/des receveurs
emailParser.prototype.xTo = function(input){
	var reg = /(.* .*)|([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]))/g;
	this.expect("X-To",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		var result = matched;
		while (input[0] !== 'X-cc') {
			var tmp = this.next(input);
			if (matched = tmp.match(reg)) {
				matched.forEach(element => {
					result.push(element.trim());
				});
			}
		}
		result = result[0].split(',');
		result = result.map((elem) => {
			return elem.trim();
		})
		return result;
	}else{
		this.errMsg("Invalid xTo", input);
	}
}

// nom prénom des personnes en copie
emailParser.prototype.xcc = function(input){
	var reg = /(.* .*)|([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]))/g;
	this.expect("X-cc",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		var result = matched;
		while (input[0] !== 'X-bcc') {
			var tmp = this.next(input);
			if (matched = tmp.match(reg)) {
				matched.forEach(element => {
					result.push(element);
				});
			}
		}
		result = result[0].split(',');
		result = result.map((elem) => {
			return elem.trim();
		})
		return result;
	}else{
		if (curS === ''){
			return [];
		} else {
			this.errMsg("Invalid xCc", input);
		}
	}
}

// nom prénom des personnes en copie cachée
emailParser.prototype.xbcc = function(input){
	var reg = /(.* .*)|([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]))/g;
	this.expect("X-bcc",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		var result = matched;
		while (input[0] !== 'X-Folder') {
			var tmp = this.next(input);
			if (matched = tmp.match(reg)) {
				matched.forEach(element => {
					result.push(element);
				});
			}
		}
		result = result[0].split(',');
		result = result.map((elem) => {
			return elem.trim();
		})
		return result;
	}else{
		if (curS === ''){
			return [];
		} else {
			this.errMsg("Invalid xBcc", input);
		}
	}
}

// dossier du mail
emailParser.prototype.xFolder = function(input){
	var reg = /(\\(\w| )*)+/g;
	this.expect("X-Folder",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid xFolder", input);
	}
}

// origine du mail
emailParser.prototype.xOrigin = function(input){
	var reg = /(\w| |-)+/g;
	this.expect("X-Origin",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid xOrigin", input);
	}
}

// nom du fichier
emailParser.prototype.xFileName = function(input){
	var reg = /(.)*(\.nsf)/g;
	this.expect("X-FileName",input)
	var curS = this.next(input);
	if(matched = curS.match(reg)){
		return matched[0];
	}else{
		this.errMsg("Invalid xFileName", input);
	}
}

// contenu du mail
emailParser.prototype.content = function(input){
	this.expect("",input);
	var curS = this.next(input)
	while(input[0] != undefined) {
		curS += this.next(input)
	}
	return curS;

}

module.exports = emailParser;