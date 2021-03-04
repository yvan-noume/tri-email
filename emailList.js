/**
 * constructeur d'une liste d'emails
 * @param {*} emails 
 */
var EmailList = function(emails) {
    this.list = emails;
    this.size = 0;
}

/**
 * ajoute un email à la liste déjà existante
 * @param {*} email 
 */
EmailList.prototype.addEmail = function(email) {
    this.size = this.list.push(email);;
}

/**
 * permet de sortir les 10 mots les plus utilisés dans les sujets
 */
EmailList.prototype.findTop10Word = function() {
    var words = [];
    var separator = /\w+/g;
    if (this.list.length > 0) {
    this.list.forEach(element => {
        if (element.subject != undefined) {
            var word = element.subject.match(separator);
            var wordOk = [];
            word.forEach(function(element) {
                wordOk.push(element.toLowerCase());
            });
            words = words.concat(wordOk);
        }
    });
    var a = [], b = [], prev;
    
    words.sort();
    for ( var i = 0; i < words.length; i++ ) {
        if ( words[i] !== prev ) {
            a.push(words[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = words[i];
    }
    var res = [];
    b.forEach(function(element, index) {
        if (res.length < 10) {
            res.push({element,index});
        } else {
            var stop = false;
            res.forEach(function(element2) {
                if (element > element2.element && !stop) {
                    element2.element = element;
                    element2.index = index;
                    stop = true;
                }
            });
        }
    });
    var c = [];
    b.forEach(function(value, index) {
        return c.push({value,index});
    });
    c.sort(function compare(x, y) {
        return y.value - x.value;
    });
    var res = [];
    for (var i=0; i<10; i++) {
        res.push({word:a[c[i].index], numberOfExchange: c[i].value})
    }
    return res;
}
return [];
}



module.exports = EmailList;