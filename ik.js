const pageWidth = 800;
function getParams(url) {

        var queryString = url.substring(url.indexOf('?') + 1);
        var paramsArr = queryString.split('&');
        var params = [];

        for (var i = 0, len = paramsArr.length; i < len; i++) {
            var keyValuePair = paramsArr[i].split('=');
            params.push({
                name: keyValuePair[0],
                value: keyValuePair[1]
            });
        }

        return params;
}
// Helper function to parse the date in format DD.MM.YYYY HH:MM
    function parseDate(dateStr) {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    }
function resourceToImageLink(resourceName)
{
	const resourceMap = {
        gold: 'data/r1.gif',
        wood: 'data/r2.gif',
        stone: 'data/r3.gif'
    };

    return resourceMap[resourceName] || '';
}
function getAllReportsFromLocalStorage()
{
	var username = getCurrentUsername();
	var server = getCurrentServerNumber();
	
			// Define the variable parts of the pattern
		const serverPattern = '\\d+'; // Matches one or more digits
		const usernamePattern = '[^_]+'; // Matches one or more characters that are not underscores
		const datePattern = '\\d{2}\\.\\d{2}\\.\\d{4} \\d{2}:\\d{2}'; // Matches the date and time in the format DD.MM.YYYY HH:MM
		const coordinatesPattern = '\\d+_\\d+_\\d+'; // Matches the coordinates in the format ocean_x_y
		
		// Construct the full pattern using the variable parts
		const fullPattern = `${server}_${username}_${datePattern}_${coordinatesPattern}`;
		
		// Create the regular expression using the RegExp constructor
		const keyPattern = new RegExp(`^${fullPattern}$`);
    // Extract all attack reports from localStorage
    const attacks = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (keyPattern.test(key)) {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const kampfbericht = JSON.parse(storedData);
                attacks.push(kampfbericht);
            }
        }
    }
		return attacks;
}
function loadAttackTargetsPage(params) {

    // Extract all attack reports from localStorage
    const attacks = getAllReportsFromLocalStorage();

    // Use a map to keep track of the latest report for each set of coordinates
    const latestReports = new Map();
    attacks.forEach(attack => {
        const { date, defender } = attack;
        const coordinates = `${defender.coordinates.ocean}:${defender.coordinates.x}:${defender.coordinates.y}`;
        const existingReport = latestReports.get(coordinates);
        if (!existingReport || parseDate(attack.date) > parseDate(existingReport.date)) {
            latestReports.set(coordinates, attack);
        }
    });
    
		// Convert the map to an array and sort by date (oldest first)
    const sortedReports = Array.from(latestReports.values()).sort((a, b) => parseDate(a.date) - parseDate(b.date));

    // Extract the s parameter from params
    var sParam = params.find(item => item.name == "s").value;

    // Create the table
    let tableHtml = '<br><table width="'+pageWidth+'" border="0" cellspacing="1" cellpadding="3"><tr><td bgcolor="#d9dff5"><b>Date</b></td><td bgcolor="#d9dff5"><b>Defender Coordinates</b></td><td bgcolor="#d9dff5" colspan="3"><b>Plundered Resources</b></td></tr>';
    sortedReports.forEach(attack => {
        const { date, defender, plunderedResources } = attack;
        const resources = ['gold', 'wood', 'stone'].map(resource => {
            const value = plunderedResources[resource] || 0;
            return `<td><img src="${resourceToImageLink(resource)}" /> ${value}</td>`;
        }).join('');
        tableHtml += `<tr><td>${date}</td><td><a href="overview.php?s=${sParam}&p=b7&pos1=${defender.coordinates.ocean}&pos2=${defender.coordinates.x}&pos3=${defender.coordinates.y}">${defender.coordinates.ocean}:${defender.coordinates.x}:${defender.coordinates.y}</a></td>${resources}</tr>`;
    });
    tableHtml += '</table>';

    // Display the table
     // Remove everything between the first table and the last hr tag
     var lasthr = $('hr', 'body table').last();
     //I would have to work with params p=map, but I'm too lazy atm
     if(lasthr)
     {        
     		$('table', 'body table').first().nextUntil(lasthr).remove();
        // Insert the generated table before the last hr tag
        lasthr.before(tableHtml);
     }
}

function processPost(params)
{
	var itemA = params.find(item => item.name == "a");
	var postSubpage = itemA ? itemA.value : null;
	switch (postSubpage) {
		case null:
			 // Handle the case where 'a' is not in the array
			 
			break;
		case 'show':
			var messageHtmlContent = $('body').children('table').eq(2).html();
			
			// Prüfen, ob das Wort "Kampfbericht" vorhanden ist
    if ($('tbody').text().includes('Kampfbericht')) {
        // Informationen extrahieren
        console.log("!Kampfbericht!");
        // Extract relevant information from the "Kampfbericht" section
				var kampfbericht = {
					  server: getCurrentServerNumber(),
					  user: getCurrentUsername(),
				    date: $("b:contains('Kampfbericht')").text().match(/vom (.*)/)[1],
				    attacker: {
				        name: $("b:contains('Einheiten des Angreifers') a").text().replace(/\s*\(\d+:\d+:\d+\)\s*/, ''),
				        coordinates: {
				            ocean: parseInt($("b:contains('Einheiten des Angreifers') a").attr('href').match(/pos1=(\d+)/)[1]),
				            x: parseInt($("b:contains('Einheiten des Angreifers') a").attr('href').match(/pos2=(\d+)/)[1]),
				            y: parseInt($("b:contains('Einheiten des Angreifers') a").attr('href').match(/pos3=(\d+)/)[1])
				        },
				        units: []
				    },
				    defender: {
				        name: $("b:contains('Einheiten des Verteidigers') a").text().replace(/\s*\(\d+:\d+:\d+\)\s*/, ''),
				        coordinates: {
				            ocean: parseInt($("b:contains('Einheiten des Verteidigers') a").attr('href').match(/pos1=(\d+)/)[1]),
				            x: parseInt($("b:contains('Einheiten des Verteidigers') a").attr('href').match(/pos2=(\d+)/)[1]),
				            y: parseInt($("b:contains('Einheiten des Verteidigers') a").attr('href').match(/pos3=(\d+)/)[1])
				        },
				        units: []
				    },
				    plunderedResources: {}
				};
				
				// Extract attacker units and losses
				$("b:contains('Einheiten des Angreifers')").closest('tr').nextAll('tr').each(function() {
				    var unitName = $(this).find('td').eq(0).text();
				    if (unitName.startsWith("Einheiten des Verteidigers")) return false; // Stop when reaching defender section
				    var total = $(this).find('td').eq(1).text();
				    var losses = $(this).find('td').eq(2).text();
				    if (unitName) {
				        kampfbericht.attacker.units.push({
				            name: unitName,
				            total: total,
				            losses: losses
				        });
				    }
				});
				
				// Extract defender units and losses
				$("b:contains('Einheiten des Verteidigers')").closest('tr').nextAll('tr').each(function() {
				    var unitName = $(this).find('td').eq(0).text();
				    if (unitName.startsWith("Geplünderte Rohstoffe")) return false; // Stop when reaching plundered resources section
				    var total = $(this).find('td').eq(1).text();
				    var losses = $(this).find('td').eq(2).text();
				    if (unitName) {
				        kampfbericht.defender.units.push({
				            name: unitName,
				            total: total,
				            losses: losses
				        });
				    }
				});
				
				// Extract plundered resources
				const resourceMapping = {
				    "Gold": "gold",
				    "Holz": "wood",
				    "Steine": "stone"
				};
				$("b:contains('Geplünderte Rohstoffe')").closest('tr').nextAll('tr').each(function() {
				    var resourceName = $(this).find('td').eq(0).text().trim();
				    var amount = parseInt($(this).find('td').eq(1).text().trim());
				    if (resourceMapping[resourceName]) {
				        kampfbericht.plunderedResources[resourceMapping[resourceName]] = amount;
				    }
				});
				
				// Create a unique key for the local storage
var key = `${kampfbericht.server}_${kampfbericht.user}_${kampfbericht.date}_${kampfbericht.defender.coordinates.ocean}_${kampfbericht.defender.coordinates.x}_${kampfbericht.defender.coordinates.y}`;

// Check if the key already exists in the local storage
if (!localStorage.getItem(key)) {
    // Store the kampfbericht object in the local storage
    console.log("add kampfbericht to the local storage");
    localStorage.setItem(key, JSON.stringify(kampfbericht));
}
else
	{
		console.log("kampfbericht already exists in localStorage");
	}
            console.log(kampfbericht);
        
    } else {
        console.log("Das Wort 'Kampfbericht' wurde nicht gefunden.");
    }
			
			break;
		
		default:
			// code
	}
}
function getCurrentServerNumber() {
		return getCurrentServerNumberByUrl(window.location.href);
}
function getCurrentServerNumberByUrl(url) {
    const regex = /s_(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
function getCurrentUsername()
{
	const username = $('b').filter(function() {
                return $(this).text().trim() !== '' && $(this).parent().text().includes('Du');
            }).first().text().trim();
	return username;
}
function updateIslandTitles() {
    

    // Helper function to calculate the time difference in a human-readable format
    function timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    }

    // Iterate over all island elements in the table
    $("table img[title^='Insel:']").each(function() {
        const title = $(this).attr('title');
        const match = title.match(/Insel: .* \((\d+):(\d+):(\d+)\)/);
        if (match) {
            const ocean = match[1];
            const x = match[2];
            const y = match[3];
            const keyPattern = new RegExp(`^.*_${ocean}_${x}_${y}$`);

            // Iterate over local storage keys to find a matching key
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (keyPattern.test(key)) {
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                        const kampfbericht = JSON.parse(storedData);
                        const latestAttackDate = kampfbericht.date;
                        const parsedDate = parseDate(latestAttackDate);
                        const timeAgo = timeSince(parsedDate);
                        const plunderedResources = kampfbericht.plunderedResources;

                        // Construct the additional information string
                        let additionalInfo = `\nLatest attack: ${latestAttackDate} (${timeAgo})\nPlundered resources:`;
                        for (const resource in plunderedResources) {
                            additionalInfo += ` ${resource}: ${plunderedResources[resource]}`;
                        }

                        // Update the title attribute with the additional information
                        $(this).attr('title', title + additionalInfo);
                        break; // Stop searching once a match is found
                    }
                }
            }
        }
    });
}
function processMap(params)
{
	updateIslandTitles();
}

function addAngriffszieleToBottom(params)
{
	// Create the new link element
    var angriffszieleLink = $('<a>', {
        href: '#',
        id: 'angriffsziele-link',
        text: 'Angriffsziele'
    });

    // Add the event listener to the new link
    angriffszieleLink.on('click', function(event) {
        event.preventDefault();
        loadAttackTargetsPage(params);
    });

    // Find the bottom list of links and insert the new link
    var sParam = params.find(item => item.name == "s").value;
    var bottomLinks = $('hr + a[href*="overview.php?s='+sParam+'&p=main"]')
    .nextAll('a[href*="overview.php?s='+sParam+'&p=settings"]');
    console.log(bottomLinks);
    bottomLinks.after(angriffszieleLink).after(' | ');
}

function parseBuildTime(params, buildType, buildItemExtractor) {
    // Extract the number of seconds from the title attribute
    var title = $('#timer1').attr('title');
    var seconds = parseInt(title.split('_')[1], 10);

    // Calculate the future date and time
    var currentDate = new Date();
    var futureDate = new Date(currentDate.getTime() + seconds * 1000);

    // Extract the build item using the provided extractor function
    var buildItem = buildItemExtractor();
    if (!buildItem) {
        console.error('Build item extraction failed');
        return;
    }

    // Create the build times object
    var buildTimes = JSON.parse(localStorage.getItem('buildTimes')) || {
        main: null,
        shaft: null,
        shipyard: null
    };

    // Overwrite the specific build type entry with the new build time
    buildTimes[buildType] = {
        item: buildItem,
        endTime: futureDate
    };

    // Remove build times that are already done
    var now = new Date();
    if (new Date(buildTimes[buildType].endTime) <= now) {
        buildTimes[buildType] = null;
    }

    // Update the object in localStorage
    localStorage.setItem('buildTimes', JSON.stringify(buildTimes));

    console.log('Build times updated:', buildTimes);
}

function extractShipyardBuildItem() {
    return $('#timer1').closest('td').find('b').eq(1).text().split(': ')[1].split('Dauer')[0].trim();
}

function extractMainBuildItem() {
    return $('#timer1').closest('p').find('b').eq(0).text().split(': ')[1].split('Dauer')[0].trim();
}

function extractShaftBuildItem() {
    return $('#timer1').closest('td').find('b').eq(1).text().split(': ')[1].split('Dauer')[0].trim();
}

function parseShipyardBuildTime(params) {
    parseBuildTime(params, 'shipyard', extractShipyardBuildItem);
}

function parseMainBuildTime(params) {
    parseBuildTime(params, 'main', extractMainBuildItem);
}

function parseShaftBuildTime(params) {
    parseBuildTime(params, 'shaft', extractShaftBuildItem);
}
function displayBuildTimes(params) {
		// Extract the s parameter from params
    var sParam = params.find(item => item.name == "s").value;
    var buildTimes = JSON.parse(localStorage.getItem('buildTimes')) || {
        main: null,
        shaft: null,
        shipyard: null
    };
		// Remove build times that are already done
    var now = new Date();
    Object.keys(buildTimes).forEach(function(type) {
        if (buildTimes[type] && new Date(buildTimes[type].endTime) <= now) {
            buildTimes[type] = null;
        }
    });
    function formatBuildTime(build) {
        if (!build) {
            return '';
        }
        return build.item + ' (fertig um ' + new Date(build.endTime).toLocaleTimeString() + ')';
    }

    var mainBuildTime = formatBuildTime(buildTimes.main);
    var shaftBuildTime = formatBuildTime(buildTimes.shaft);
    var shipyardBuildTime = formatBuildTime(buildTimes.shipyard);
		
    if (mainBuildTime) {
        $('a[href*="overview.php?s='+sParam+'&p=b1"]').after('<br>' + mainBuildTime);
    }
    if (shaftBuildTime) {
        $('a[href*="overview.php?s='+sParam+'&p=b6"]').after('<br>' + shaftBuildTime);
    }
    if (shipyardBuildTime) {
        $('a[href*="overview.php?s='+sParam+'&p=b7"]').after('<br>' + shipyardBuildTime);
    }
}
function parseFleetInformation() {
    var fleetInfo = [];

    $('table:contains("Deine Flotten") tr').each(function() {
        var statusCell = $(this).find('td').eq(0);
        var timeCell = $(this).find('td').eq(1);

        if (statusCell.length && timeCell.length) {
            var statusText = statusCell.text().trim();
            var timeText = timeCell.find('div').attr('title');
            var link = statusCell.find('a').attr('href');
            var idMatch = link ? link.match(/id=(\d+)/) : null;
            var id = idMatch ? idMatch[1] : null;

            if (timeText) {
                var timeParts = timeText.split('_');
                var seconds = parseInt(timeParts[1], 10);
                var futureDate = new Date(Date.now() + seconds * 1000);

                var coordinatesMatch = statusText.match(/\((\d+):(\d+):(\d+)\)/);
                var coordinates = coordinatesMatch ? {
                    ocean: coordinatesMatch[1],
                    x: coordinatesMatch[2],
                    y: coordinatesMatch[3]
                } : null;

                var isReturn = statusText.startsWith("Rückkehr");

                fleetInfo.push({
                    id: id,
                    status: statusText,
                    arrivalOrDepartureTime: futureDate,
                    coordinates: coordinates,
                    isReturn: isReturn
                });
            }
        }
    });

    localStorage.setItem('fleetInfo', JSON.stringify(fleetInfo));
    console.log('Fleet information updated:', fleetInfo);
}

function displayFleetInfo(params) {
    var fleetInfo = JSON.parse(localStorage.getItem('fleetInfo')) || [];

    if (fleetInfo.length === 0) {
        return;
    }
		// Extract the s parameter from params
    var sParam = params.find(item => item.name == "s").value;
    var fleetTable = '<table width="800" border="0" cellspacing="1" cellpadding="3"><tr><td bgcolor="#d9dff5" colspan="6"><b>Deine Flotten</b></td></tr>';
    fleetTable += '<tr><td bgcolor="#d9dff5"><b>ID</b></td><td bgcolor="#d9dff5"><b>Status</b></td><td bgcolor="#d9dff5"><b>Ankunft/Abfahrt</b></td><td bgcolor="#d9dff5"><b>Koordinaten</b></td><td bgcolor="#d9dff5"><b>Rückkehr</b></td><td bgcolor="#d9dff5"><b>Aktion</b></td></tr>';

    fleetInfo.forEach(function(fleet) {
        fleetTable += '<tr>';
        fleetTable += '<td bgcolor="#d9dff5">' + fleet.id + '</td>';
        fleetTable += '<td bgcolor="#d9dff5"><a href="https://ik-seite.de/s_'+getCurrentServerNumber()+'/overview.php?s='+sParam+'&p=b7&sub=show&id='+fleet.id+'">' + fleet.status + '</a></td>';
        fleetTable += '<td bgcolor="#d9dff5">' + new Date(fleet.arrivalOrDepartureTime).toLocaleString() + '</td>';
        fleetTable += '<td bgcolor="#d9dff5">' + (fleet.coordinates ? fleet.coordinates.ocean + ':' + fleet.coordinates.x + ':' + fleet.coordinates.y : 'N/A') + '</td>';
        fleetTable += '<td bgcolor="#d9dff5">' + (fleet.isReturn ? 'Ja' : 'Nein') + '</td>';
        if (!fleet.isReturn) {
            fleetTable += '<td bgcolor="#d9dff5"><a href="https://ik-seite.de/s_'+getCurrentServerNumber()+'/overview.php?s='+sParam+'&p=b7&sub=cancel&id=' + fleet.id + '">Abbruch</a></td>';
        } else {
            fleetTable += '<td bgcolor="#d9dff5"></td>';
        }
        fleetTable += '</tr>';
    });

    fleetTable += '</table>';

    $('hr').prevAll('table').first().before(fleetTable);
}
//Load jQuery library using plain JavaScript
(function(){
	$('html').find('script[src="/ad-blocker.js"]').remove();
  $('iframe').remove();
  var realContent = $('table tbody tr td').first().html();
  //$('body table').replaceWith(realContent);
  $('body div').last().remove();
  $('body div').last().remove();
  $('body div').last().remove();
  $('[width="400"], [width=400]').attr('width', pageWidth);
  var params = getParams(window.location.href);
  console.log(params);
  
  addAngriffszieleToBottom(params);

  var subPage = params.find(item => item.name == "p").value;
  switch (subPage) {
  	case 'mehl': //Post
  		processPost(params);
  		break;
  	case 'map':
  		processMap(params);
          break;
      case 'b1': //Hauptgebäude
        parseMainBuildTime(params);
          break;
      case 'b6': // Shaft (Baracke)
        parseShaftBuildTime(params);
            break;
      case 'b7': //Werft
        parseShipyardBuildTime(params);
        parseFleetInformation();
          break;
      case 'main':
      	 // Display build times on the front page
      	displayBuildTimes(params);
      	displayFleetInfo(params);
      	break;
  	default:
  		// code
  }
 
    
  console.log(params);
})();
