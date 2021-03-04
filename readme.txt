Pour installer le projet, se placer dans le dossier app et exécutez les commandes suivantes (il est préférable d'être sur 
un utilisateur root) : 
    - sudo npm install
    - sudo chmod 777 contact
    - sudo chmod 777 email_extracted

Pour lancer le projet :
    - node appEmail.js <command> <arguments> <options>

SPEC 1 :
    - node appEmail.js consultEmails "arnold" data_gl02_project/donneesSujetB/arnold-j/ 

SPEC 2 :
    - node appEmail.js extractEmails "arnold" data_gl02_project/donneesSujetB/arnold-j/ 

SPEC 3 :
    - node appEmail.js extractContacts "arnold" data_gl02_project/donneesSujetB/arnold-j/ 

SPEC 4 (le -t est optionnel et peut s'écrire --time):
    - node appEmail.js numberEmails "arnold" data_gl02_project/donneesSujetB/arnold-j/ 01/12/2000 -t 01/01/2001

SPEC 5 (le -e est optionnel et peut s'écrire --export):
    - node appEmail.js buzzyDay "arnold" data_gl02_project/donneesSujetB/arnold-j/ -e

SPEC 6 (le -e est optionnel et peut s'écrire --export):
    - node appEmail.js topCollaborators "arnold" data_gl02_project/donneesSujetB/arnold-j/ -e

SPEC 7 (le -e est optionnel et peut s'écrire --export):
    - node appEmail.js topWords "arnold" data_gl02_project/donneesSujetB/arnold-j/ -e

SPEC 8 (le -f est optionnel et peut s'écrire --format, par défaut l'option sera png) :
    - node appEmail.js exportExchanges "arnold" data_gl02_project/donneesSujetB/arnold-j/ -f svg