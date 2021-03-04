const fs = require('fs');
const colors = require('colors');

const vg = require('vega');
const vgl = require('vega-lite');
const EmailParser = require('./emailParser');
const Contact = require('./contact.js');

const cli = require("@caporal/core").default;
const emailParser = require('./emailParser');
const readdir = function (analyzer, dir) {
	filenames = fs.readdirSync(dir); 
	filenames.forEach(function(element) {
		var actualFile = dir+element;
		if (fs.existsSync(actualFile) && fs.lstatSync(actualFile).isDirectory()) {
			readdir(analyzer,actualFile+'/');
		} else {
		var data = fs.readFileSync(actualFile,'utf8')
		analyzer.parse(data);
		}
		
	});
}
cli
	.version('email-app')
	.version('1.0.0')

	/* 
		Verify if is a file valid
	 */
	.command('checkf', 'Check if a file is correctly written to the .nsf format')
	.argument('<file>', 'The file to check with email parser')
	.action(({args, options, logger}) => {
		var analyzer = new EmailParser(false, false);
			fs.readFile(args.file, 'utf8', function (err,data) {
				if (err) {
					return logger.warn(err);
				}
		  
				analyzer.parse(data);
				
				if(analyzer.errorCount === 0){
					logger.info("The .nsf file is a valid nsf file".green);
				}else{
					logger.info("The .nsf file contains error".red);
				}
	
			});
		
	})

	/*
		Spec1
	*/
	.command('consultEmails', 'consult emails from a collaborator')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.action(({args, options, logger}) => {

		var analyzer = new EmailParser(false, false, args.collaborator);
		var dir = args.directory;
		readdir(analyzer, dir);
		var chaineARetourner = "";
		if (analyzer.parsedEmail.list.length != 0) {
			analyzer.parsedEmail.list.forEach(function(element) {
				chaineARetourner += 'Email envoyé par '+element.from+', le : '+element.date+', avec pour sujet "'+element.subject+'"\n\n';
			});
		}
		logger.info(chaineARetourner);
		

	})

	/*
		spec 2
	*/
	.command('extractEmails', 'extract emails from a collaborator')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.action(({args, options, logger}) => {

		var analyzer = new EmailParser(false, false, args.collaborator);
		var dir = args.directory;
		readdir(analyzer, dir);
		var i = 1;
		if (analyzer.parsedEmail.list.length != 0) {
		analyzer.parsedEmail.list.forEach(function(element) {
			fs.writeFileSync('./email_extracted/'+i+'_', element.originalFile);
			i++;
		});
		logger.info('Emails extracted!'.blue);
	} else {
		logger.info('Aucun mails à extraire');
	}

	})

	
	/*
	spec 3
	*/
	.command('extractContacts', 'extract contacts from email ')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.action(({args, options, logger}) => {

		var size;
		var getCollaborator;
		var analyzer = new EmailParser(false, false, args.collaborator);
		var dir = args.directory;
		readdir(analyzer, dir);
		var dateDuJour = new Date();
		dateDuJour = dateDuJour.toDateString();
		analyzer.contacts.list.forEach(function(element) {
				logger.info(element.toVcard());
				fs.writeFileSync('contact/'+ element.name+'_'+dateDuJour+'.vcf', element.toVcard(), function(err) {
					if (err) {
						logger.info(err);
					}
					logger.info("File exported".blue);
				})
		});
		

	})

	/*
	spec 4
	*/
	.command('numberEmails', 'display the number of emails of a collaborator during a period of time')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.argument('<startTime>', 'The start of the period')
	.option('-t --time <endTime>', 'The optional end of the period')
	.action(({args, options, logger}) => {

		var size;
		var dateDebut;	
		var dateFin;
		var numberEmail = 0;
		var analyzer = new EmailParser(false, false, args.collaborator);
		var dir = args.directory;
		readdir(analyzer, dir);
		dateDebut = new Date('"'+args.startTime.split("/").reverse().join("-")+ '"');
					if(options.time){
						dateFin = new Date('"'+options.time.split("/").reverse().join("-")+ '"');
					}
		analyzer.parsedEmail.list.forEach(function (element) {
			if(!options.time){
				if(element.date.getTime() > dateDebut.getTime()){
					numberEmail++;							
				}
			}else{
				if(element.date.getTime() > dateDebut.getTime() && element.date.getTime() < dateFin.getTime()){
					numberEmail++;	
				}	
			}
		});
					
		logger.info("le nombre d'emails échangés est : " + numberEmail);
	})

	/*
	 spec 5
	*/
	.command('buzzyDay', 'display the numnbre of email of a collaborator during a period of time')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.option('-e --export','Export the file if present')
	.action(({args, options, logger}) => {

		var size;
		var getHours;
		var getDay;
		var getCollaborator;
		var day;
		var month;
		var year;
		var buzzyDay = "";
		var analyzer = new EmailParser(false, false, args.collaborator);
		var dir = args.directory;
		readdir(analyzer, dir);
		analyzer.parsedEmail.list.forEach(function(element) {
			getHours = element.date.getHours();
			getDay = element.date.getDay();
			if((getHours >= 22 && getHours <= 23) || (getHours >= 0 && getHours < 8) || getDay == 6 || getDay == 0){
				day = element.date.getDate();
				month = element.date.getMonth();
				year = element.date.getFullYear();

				buzzyDay +=day + " " + month + " " + year + " \n" ;
				logger.info(buzzyDay);
			}
		});
		if (options.export) {
			fs.writeFile('buzzyDay.txt', buzzyDay, function(err) {
				if (err) {
					logger.info(err);
				}
				logger.info("File exported".blue);
			})
		}
	})

	/*
		Spec 6
	*/
	.command('topCollaborators', 'Top 10 of the interlocutor of a collaborator')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.option('-e --export','Export the file if present')
	.action(({args, options, logger}) => {
		let analyzer = new EmailParser(false,false, args.collaborator);
		readdir(analyzer, args.directory);
			var top10 = analyzer.contacts.findTop10Collab();
			var exportFiche = "Top 10 des collaborateurs avec qui "+args.collaborator+" a échangé :"
			var i = 1;
			if (top10.length>0) {
			top10.forEach(function(element) {
				exportFiche += "\nN°"+i+" : "+element.email+" avec un total de "+element.nbContactTime+" emails"
				i++;
			})
		} else {
			var exportFiche = args.collaborator+" n'a échangé avec personne.";
		}
			logger.info(exportFiche);
			if (options.export) {
				fs.writeFile('top10collaborator.txt', exportFiche, function(err) {
					if (err) {
						logger.info(err);
					}
					logger.info("File exported".blue);
				})
			}
		})

	/*
		Spec 7
	*/
	.command('topWords', 'Top 10 of the words in subjects')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.option('-e --export','Export the file if present')
	.action(({args, options, logger}) => {
		let analyzer = new EmailParser(false,false, args.collaborator);
		readdir(analyzer, args.directory);
		var top10 = analyzer.parsedEmail.findTop10Word();
		var exportFiche = "Top 10 des mots dans les sujets des mails :"
		var i = 1;
		if (top10.length > 0) {
		top10.forEach(function(element) {
			exportFiche += "\nN°"+i+" : "+element.word+" avec un total de "+element.numberOfExchange+" utilisations"
			i++;
		})
		
	} else {
		var exportFiche = "Aucun mots dans les sujets";
	}
	logger.info(exportFiche); 
		if (options.export) {
			fs.writeFile('top10words.txt', exportFiche, function(err) {
				if (err) {
					logger.info(err);
				}
				logger.info("File exported".blue);
			})
		}
	})

	/*
		Spec 8
	*/
	.command('exportExchanges', 'Export exchanges in a graph')
	.argument('<collaborator>', 'The name/surname/email of the collaborator to analyze')
	.argument('<directory>', 'The source directory to analyze with the email parser')
	.option('-f,--format <format>', 'Precise if the graphic should be exported as a svg or png file',
    { validator: ['svg', 'png'], default: 'png' })
	.action(({args, options, logger}) => {
		let analyzer = new EmailParser(false,false, args.collaborator);
		readdir(analyzer, args.directory);
		var datajson = analyzer.contacts.getJSONData(args.collaborator);
		var spec = {
			"$schema": "https://vega.github.io/schema/vega-lite/v4.json",
			"data": { "values": datajson},
			"title": "Nombre de collaborateurs et de leurs échnages avec l'interlocteur "+args.collaborator,
			"encoding": {
			  "x": {
				"field": "collab2",
				"title": "Collaborateurs",
				"axis": {"grid": true}
			  },
			  "y": {
				"field": "collab1",
				"title": "Interlocuteur"},
			  
			  "size": {
				"field": "nbContactTime",
				"type": "quantitative",
				"legend": {"clipHeight": 60},
				"scale": {"rangeMin": 1}
			  }
			},
			"mark": {
				"type": "circle",
				"opacity": 0.8,
				"stroke": "black",
				"strokeWidth": 1,
				"color" : "red"
			  }
		}
		const vgSpec = vgl.compile(spec).spec;
		const view = new vg.View(vg.parse(vgSpec))
			.renderer('none')
			.initialize();
		// generate a static SVG image
		if (options.format === 'svg')
		{
			const fileName = 'scatterplot.svg';
			view.toSVG()
			.then((svg) =>
			{
				fs.writeFileSync(fileName, svg, (err) =>
				{
					if (err)
					{
						logger.info(err.red);
					}
				});
				logger.info('Graphique exporté sous le nom de '+fileName);
			})
			.catch((err) =>
			{
				logger.info(err.red);
			});
		} else {
			view.toCanvas()
			.then((canvas) => {
			  const fileName = "scatterplot.png";
			  const pngstream = canvas.createPNGStream();
			  const outstream= fs.createWriteStream(fileName);
			  pngstream.pipe(outstream);
			  outstream.on('finish', () => logger.info('Graphique exporté sous le nom de '+fileName));
	  
			})
		}
	});

	
cli.run(process.argv.slice(2));
	