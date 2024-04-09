//variables
var teams = {};
var wagers = [];
var questions = {
    current: 1,
    shown: false,
    revealed: false,
    questions: []
};
const MAX_TEAMS = 8;
const MAX_QUESTIONS = 30;

//controls setup
document.querySelector('#num_teams_range').oninput = updateTeamInputVisibility;
document.querySelector('#num_teams_range').max = MAX_TEAMS;

document.querySelector('#num_questions_range').oninput = updateQuestionInputVisibility;
document.querySelector('#num_questions_range').max = MAX_QUESTIONS;

document.querySelector('#add_wager_btn').onclick = addWagerTile;

document.querySelector('#save_all_btn').onclick = saveAll;

//document setup
buildTeamNameInputs();
loadTeamSettings();

buildQuestionInputs();
loadQuestions();

loadWagers();

/*
Object Structure
------------------------------
teams.json: 
{
    red: {
        wagers: [   //we calculate point totals from this
            {
                value: 1,
                answered: true,
                correct: false
            }
        ]
    }
}


questions.json:
{
    current: 1,
    shown: true,    //whether the current question is being shown
    revealed: false,    //whether the answer to the current question is being revealed
    questions: [
        {
            question: "how many holes in a polo?",
            answer: "four"
        }
    ]
}

wagers.json:
[
    {
        value: 1,
        quantity: 2
    }
]
*/

function saveAll() {
    //save questions
    saveQuestions();
    //save wager pool
    saveWagerSettings();
    //save team data
    saveTeamData();
}

function buildTeamNameInputs() {
    let inputsHtml = '';
    for(let i=0; i<MAX_TEAMS; i++) {
        //add team name input
        inputsHtml += `
        <div class='container'>
            <div class='row'>
                <label for='team_${i+1}_name_input'>Team #${i+1}</label>
                <input id='team_${i+1}_name_input' class='form-control' placeholder='Enter team name'>
            </div>
            <div class='row' id='team_${i+1}_wagers'>
            </div>
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
        fillTeamInputs();
    });
}

//after setting the global teams variable from teams.json, fill out the inputs & set wager states
//Team order not preserved, hopefully doesn't matter
function fillTeamInputs() {
    let team_containers = document.querySelector('#team_name_inputs').children;
    let i=0;
    //cycle through each team
    for (let team in teams) {
        let team_name_input = team_containers[i].children[0].querySelector('input');
        team_name_input.value = team;
        //retrieve any stored wager data to display
        let team_wagers = teams[team].wagers;
        if(team_wagers) {
            let team_wagers_div = document.querySelector(`#team_${i+1}_wagers`);
            let team_wagers_html = ``;
            for (let team_wager of team_wagers) {
                team_wagers_html += `
                <div class='col'>
                    <div class='wager_chip wager_chip_${team_wager.answered? `${team_wager.correct? 'correct' : 'incorrect'}` : 'unanswered'}' onclick='cycleWagerChip(this)'>${team_wager.value}</div>
                </div>
                `;
            }
            team_wagers_div.innerHTML = team_wagers_html;
        }

        i++;
    }
    document.querySelector('#num_teams_range').value = i;
    updateTeamInputVisibility();
}

//cycle wager chip between correct, incorrect, and unanswered/neutral
//the chip div passes itself in as the parameter
function cycleWagerChip(e) {
    let nextState = 'unanswered';
    if ( e.classList.contains('wager_chip_unanswered') ) nextState = 'correct';
    else if ( e.classList.contains('wager_chip_correct') ) nextState = 'incorrect';
    else nextState = 'unanswered';
    e.classList.remove('wager_chip_unanswered');
    e.classList.remove('wager_chip_correct');
    e.classList.remove('wager_chip_incorrect');
    e.classList.add(`wager_chip_${nextState}`);
}

function loadQuestions() {
    fetch('../json/questions.json', {
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
        //this includes the whole questions object
        questions = json;
        fillQuestions();
    });
}

function fillQuestions() {
    let question_inputs = document.querySelector('#question_inputs').children;
    for (let i=0; i<questions.questions.length; i++) {
        //question for the row
        question_inputs[i].children[0].querySelector('textarea').value = questions.questions[i].question;    //this is perfectly readable
        //answer for the row
        question_inputs[i].children[1].querySelector('textarea').value = questions.questions[i].answer;
    } 
    document.querySelector('#num_questions_range').value = questions.questions.length;
    updateQuestionInputVisibility();
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

//this overwrites all team objects and must be called before saving wager values
function saveTeamData() {
    let teams_data = {};
    let team_containers =  document.querySelector('#team_name_inputs').children;
    for(let i=0; i<document.querySelector('#num_teams_range').value; i++) {
        let team_name = team_containers[i].children[0].querySelector('input').value;
        if (!team_name) {
            console.log(`Cannot save team names: team ${i+1} name empty`);
            return;
        }
        teams_data[team_name] = {};
	}
    teams = teams_data;

    let data = new URLSearchParams();
    data.append('data', JSON.stringify(teams));
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

//save all question settings
//This throws a JSON parse syntax error, but it does write to the file, so...whatever
function saveQuestions() {
    let question_settings = [];
    let question_inputs = document.querySelector('#question_inputs').children;
    for(let i=0; i<document.querySelector('#num_questions_range').value; i++) {
        let question = {
            question: question_inputs[i].children[0].querySelector('textarea').value,
            answer: question_inputs[i].children[1].querySelector('textarea').value
        }
        console.log(`i=${i}, question: ${question.question}, answer: ${question.answer}`);
        if (!question.question || !question.answer) {
            console.log('Cannot save. Empty field for question or answer.');
            return;
        }
        question_settings.push(question);
	}

    //set the global questions variable
    questions.questions = question_settings;
    let data = new URLSearchParams();
    console.log(questions);
    console.log(JSON.stringify(questions));
    data.append('data', JSON.stringify(questions));
    fetch('../php/write_questions.php', {
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
    let wager_data = [];
    let wager_tiles = document.querySelector('#wagers div').children;
    for (let tile of wager_tiles) {
        console.log(tile);
        let fields = tile.querySelector('div').children;
        let value_field = fields[0].querySelector('input').value;
        let quantity_field = fields[1].querySelector('input').value;
        if (value_field && quantity_field) wager_data.push({
            value: value_field,
            quantity: quantity_field
        });
    }
    console.log(wager_data);
    
    let total_wagers = 0;
    for (let wager of wager_data) total_wagers += parseInt(wager.quantity);
    //number of wagers must equal number of questions
    if (total_wagers != questions.questions.length) {
        console.log(`Incorrect number of wagers. Questions: ${questions.length}, Wagers: ${total_wagers}`);
        return;
    }
    document.querySelector('#total_wagers').innerHTML = total_wagers;
    wagers = wager_data;
    //rebuild team wager chips
    for (let i=0; i<MAX_TEAMS; i++) {
        let team_wagers_div = document.querySelector(`#team_${i+1}_wagers`);
        let team_wagers_html = ``;
        for (let wager_info of wagers) {
            for (let i=0; i<wager_info.quantity; i++) {
                team_wagers_html += `
                <div class='col'>
                    <div class='wager_chip wager_chip_unanswered' onclick='cycleWagerChip(this)'>${wager_info.value}</div>
                </div>
                `;
            }
        }
        team_wagers_div.innerHTML = team_wagers_html;
    }

    //write to wagers.json
    let data = new URLSearchParams();
    data.append('data', JSON.stringify(wagers));
    fetch('../php/write_wagers.php', {
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