//variables
var teams = {};
var wagers = {};
const MAX_TEAMS = 8;
const MAX_QUESTIONS = 30;

//controls setup
document.querySelector('#num_teams_range').oninput = updateTeamInputVisibility;
document.querySelector('#num_teams_range').max = MAX_TEAMS;

document.querySelector('#num_questions_range').oninput = updateQuestionInputVisibility;
document.querySelector('#num_questions_range').max = MAX_QUESTIONS;

document.querySelector('#add_wager_btn').onclick = addWagerTile;

//document setup
buildTeamNameInputs();
loadTeamSettings();

buildQuestionInputs();
loadQuestionSettings();

loadWagers();

function buildTeamNameInputs() {
    let inputsHtml = '';
    for(let i=0; i<MAX_TEAMS; i++) {
        inputsHtml += `
        <div>
            <label for='team_${i+1}_name_input'>Team #${i+1}</label>
            <input id='team_${i+1}_name_input' class='form-control' placeholder='Enter team name'>
        </div>
        `;
    }
    document.querySelector('#team_name_inputs').innerHTML = inputsHtml;
}

function buildQuestionInputs() {
    let inputsHtml = '';
    for(let i=0; i<MAX_QUESTIONS; i++) {
        inputsHtml += `
        <div class='row'>
            <div class='col'>
                <label for='question_${i+1}_input'>Question #${i+1}</label>
                <textarea id='question_${i+1}_input' class='form-control' rows='1' placeholder='Enter question'></textarea>
            </div>
            <div class='col'>
                <label for='answer_${i+1}_input'>Answer to question #${i+1}</label>
                <textarea id='answer_${i+1}_input' class='form-control' rows='1' placeholder='Enter answer'></textarea>
            </div>
        </div>
        `;
    }
    document.querySelector('#question_inputs').innerHTML = inputsHtml;
}



function updateTeamInputVisibility() {
    let num_teams = document.querySelector('#num_teams_range').value;
    document.querySelector('#num_teams_display').innerHTML = num_teams.toString();
    let team_name_inputs =  document.querySelector('#team_name_inputs').children;
    for(let i=0; i<team_name_inputs.length; i++) {
        if(i+1 <= num_teams) {
            team_name_inputs[i].style.display = '';
        } else {
            team_name_inputs[i].style.display = 'none';
        }
    }
}

function updateQuestionInputVisibility() {
    let num_questions = document.querySelector('#num_questions_range').value;
    document.querySelector('#num_questions_display').innerHTML = num_questions.toString();
    let question_inputs =  document.querySelector('#question_inputs').children;
    for(let i=0; i<question_inputs.length; i++) {
        if(i+1 <= num_questions) {
            question_inputs[i].style.display = '';
        } else {
            question_inputs[i].style.display = 'none';
        }
    }
}

function loadTeamSettings() {
    fetch('../json/teams.json', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'max-age=0'
        }
    }).then(response => {
        if(!response.ok) {
            throw response;
        }
        return response.json();
    }).catch(error => {
        console.log(error);
    }).then(json => {
        console.log(json);
        teams = json;
        //updateTeamInputs();
    });
}

function loadQuestionSettings() {

}

function loadWagers() {
	fetch('../json/wagers.json', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'max-age=0'
        }
    }).then(response => {
        if(!response.ok) {
            throw response;
        }
        return response.json();
    }).catch(error => {
        console.log(error);
    }).then(json => {
        console.log(json);
        buildWagers(json);
    });
}

function buildWagers(wager_array) {
	let wagers_html = ``;
	for (let wager of wager_array) {
		wagers_html += `
		<div class='col'>
			<div class='container wager_tile'>
				<div class='row'>
					Value: <input type='number' min='0' value=${wager.value}>
				</div>
				<div class='row'>
					Quantity: <input type='number' min='1' value=${wager.quantity}>
				</div>
				<br>
				<div class='row'>
					<button type="button" class='btn btn-danger' onclick='deleteWager(this)'>Delete</button>
				</div>
			</div>
		</div>
		`;
	}

	document.querySelector('#wagers div').innerHTML = wagers_html;
}

function addWagerTile() {
    let wager_html = `
		<div class='col'>
			<div class='container wager_tile'>
				<div class='row'>
					Value: <input type='number' min='0'>
				</div>
				<div class='row'>
					Quantity: <input type='number' min='1'>
				</div>
				<br>
				<div class='row'>
					<button type="button" class='btn btn-danger' onclick='deleteWager(this)'>Delete</button>
				</div>
			</div>
		</div>
		`;
    document.querySelector('#wagers div').innerHTML += wager_html;
}

function deleteWager(e) {
    e.parentElement.parentElement.parentElement.remove();
}

function saveTeamSettings() {
    let teams_settings = {};
    let team_name_inputs =  document.querySelector('#team_name_inputs').children;
    for(let name of team_name_inputs) {

	}


    let data = new URLSearchParams();
    data.append('data', JSON.stringify(settings));
    fetch('../php/write_teams.php', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'max-age=0'
        }
    }).then(response => {
        if(!response.ok) {
            throw response;
        }
        console.log(response.json());
    }).catch(error => {
        console.log(error);
    });
}

function saveWagerSettings() {
    
}


//write test function
/*
async function writeJson() {
    let testObject = {
        teams: 2,
        round: 0
    }
    let data = new URLSearchParams();
    data.append('data', JSON.stringify(testObject));
    fetch('../php/write_teams.php', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'max-age=0'
        }
    }).then(response => {
        if(!response.ok) {
            throw response;
        }
        console.log(response);
    }).catch(error => {
        console.log(error);
    });

    //let responseText = await response.text();
    //console.log(responseText);
}
*/

//read test function
/*
async function readJson() {
    console.log('reading from teams.json...');
    const response = await fetch('../json/teams.json', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'max-age=0'
        }
    });
    //const teams = await response.json();
    //should also check if response.ok
    const teams = await response.json();

    console.log(teams);
}
*/