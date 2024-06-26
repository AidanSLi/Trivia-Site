//for some reason the relative path changes??
const ROOT = '';
//variables
var teams = [];
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
document.querySelector('#save_controls_btn').onclick = saveControls();
document.querySelector('#save_teams_btn').onclick = saveTeamData();
document.querySelector('#save_questions_btn').onclick = saveQuestions();
document.querySelector('#save_wagers_btn').onclick = saveWagerSettings();

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
[
    {
        team_name: "red",
        score_bias: 3,
        wagers: [   //we calculate point totals from this
            {
                value: 1,
                answered: true,
                correct: false
            }
        ]
    }
]


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
    //save question controls
    saveControls();
}

function buildTeamNameInputs() {
    let inputsHtml = '';
    for(let i=0; i<MAX_TEAMS; i++) {
        //add team name input
        inputsHtml += `
        <div class='container team_control_box'>
            <div class='row' id='team_${i+1}_header'>
                <div class='col-4'>
                    <label for='team_${i+1}_name_input'>Team #${i+1}</label>
                    <input id='team_${i+1}_name_input' class='form-control' placeholder='Enter team name'>
                </div>
                <div class='col-4'>
                    <label for='team_${i+1}_score_bias'>Manual score bias</label>
                    <input type="number" class='form-control' id='team_${i+1}_score_bias' oninput='updateScoreDisplays()'>
                </div>
                <div class='col-4 team_running_info'>
                    <div>
                        Wagers used: <span id='team_${i+1}_wagers_used'></span>
                    </div>
                    <div>
                        Total Score: <span id='team_${i+1}_total_score'></span>
                    </div>
                </div>
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
    fetch(`${ROOT}json/teams.json`, {
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
        //console.log(json);
        teams = json;
        fillTeamInputs();
    });
}

//after setting the global teams variable from teams.json, fill out the inputs & set wager states
//Team order not preserved, hopefully doesn't matter
function fillTeamInputs() {
    let team_containers = document.querySelector('#team_name_inputs').children;
    //cycle through each team
    for (let i=0; i<teams.length; i++) {
        let team_name_input = document.querySelector(`#team_${i+1}_name_input`);
        team_name_input.value = teams[i].team_name;
        //retrieve any stored wager data to display
        let team_wagers = teams[i].wagers;
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
        //fill manual score bias
        document.querySelector(`#team_${i+1}_score_bias`).value = teams[i].score_bias;
    }
    document.querySelector('#num_teams_range').value = teams.length;
    updateTeamInputVisibility();
    updateScoreDisplays();
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

    updateScoreDisplays();
}

//calculate all scores and wagers used based on display
function updateScoreDisplays() {
    for (let i=0; i<document.querySelector('#team_name_inputs').children.length; i++) {
        let score_bias_input = document.querySelector(`#team_${i+1}_score_bias`);
        let wagers_used = 0;
        let total_score = score_bias_input.value? parseInt(score_bias_input.value) : 0;
        let wager_cols = document.querySelector(`#team_${i+1}_wagers`).children;
        for (let wager_col of wager_cols) {
            let chip = wager_col.querySelector('div');
            if ( !chip.classList.contains('wager_chip_unanswered') ) {
                wagers_used++;
                if ( chip.classList.contains('wager_chip_correct') ) {
                    total_score += parseInt(chip.innerHTML);
                }
            }
        }
        document.querySelector(`#team_${i+1}_wagers_used`).innerHTML = wagers_used;
        document.querySelector(`#team_${i+1}_total_score`).innerHTML = total_score;
    }
}

function loadQuestions() {
    fetch(`${ROOT}json/questions.json`, {
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
        //console.log(json);
        //this includes the whole questions object
        questions = json;
        fillQuestions();
    });
}

function fillQuestions() {
    //update question section
    let question_inputs = document.querySelector('#question_inputs').children;
    for (let i=0; i<questions.questions.length; i++) {
        //question for the row
        question_inputs[i].children[0].querySelector('textarea').value = questions.questions[i].question;    //this is perfectly readable
        //answer for the row
        question_inputs[i].children[1].querySelector('textarea').value = questions.questions[i].answer;
    } 
    document.querySelector('#num_questions_range').value = questions.questions.length;
    updateQuestionInputVisibility();

    //update current question section
    document.querySelector('#current_question_number').value = questions.current;
    //question visibility will stay on "not visible" so the answer is not accidentally shown
}

function loadWagers() {
	fetch(`${ROOT}json/wagers.json`, {
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
        //console.log(json);
        wagers = json;
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
					Value: <input type='number' class='form-control' min='0' value=${wager.value}>
				</div>
				<div class='row'>
					Quantity: <input type='number' class='form-control' min='1' value=${wager.quantity}>
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
		`;
    let new_tile = document.createElement('div');
    new_tile.classList.add('col');
    new_tile.innerHTML = wager_html;
    document.querySelector('#wagers div').appendChild(new_tile);
}

function deleteWager(e) {
    e.parentElement.parentElement.parentElement.remove();
}

//this saves all team objects with current wager chip values
function saveTeamData() {
    let teams_data = [];
    let team_containers =  document.querySelector('#team_name_inputs').children;
    for(let i=0; i<document.querySelector('#num_teams_range').value; i++) {
        let team_name = team_containers[i].children[0].querySelector('input').value;
        if (!team_name) {
            console.log(`Cannot save team names: team ${i+1} name empty`);
            return;
        }
        let team_wagers = [];
        let team_wagers_div = document.querySelector(`#team_${i+1}_wagers`);
        for (let team_wager_col of team_wagers_div.children) {
            let team_wager_chip = team_wager_col.querySelector('div');
            //console.log(team_wager_chip);
            //console.log(team_wager_chip.classList.contains('wager_chip_unanswered'));
            let chip_value = parseInt(team_wager_chip.innerHTML);
            team_wagers.push({
                value: chip_value,
                answered: !team_wager_chip.classList.contains('wager_chip_unanswered'),
                correct: team_wager_chip.classList.contains('wager_chip_correct')
            });
        }
        //console.log(team_wagers);
        let score_bias_input = document.querySelector(`#team_${i+1}_score_bias`);
        let score_bias = score_bias_input.value ? parseInt(score_bias_input.value) : 0;
        teams_data.push({
            team_name: team_name,
            wagers: team_wagers,
            score_bias: score_bias
        });
	}
    teams = teams_data;
    //console.log(teams);

    let data = new URLSearchParams();
    data.append('data', JSON.stringify(teams));
    fetch(`${ROOT}php/write_teams.php`, {
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
        //console.log(response.json());
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
        //console.log(`i=${i}, question: ${question.question}, answer: ${question.answer}`);
        if (!question.question || !question.answer) {
            console.log('Cannot save. Empty field for question or answer.');
            return;
        }
        question_settings.push(question);
	}

    //set the global questions variable
    questions.questions = question_settings;
    questions.current = document.querySelector('#current_question_number').value ? document.querySelector('#current_question_number').value : 1;
    let visibility_selection = document.querySelector('#question_visibility_select').value;
    if (visibility_selection == 1) {
        questions.shown = false;
        questions.revealed = false;
    } else if (visibility_selection == 2) {
        questions.shown = true;
        questions.revealed = false;
    } else if (visibility_selection == 3) {
        questions.shown = true;
        questions.revealed = true;
    }
    let data = new URLSearchParams();
    //console.log(questions);
    //console.log(JSON.stringify(questions));
    data.append('data', JSON.stringify(questions));
    fetch(`${ROOT}php/write_questions.php`, {
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
        //console.log(response.json());
    }).catch(error => {
        console.log(error);
    });
}

function saveWagerSettings() {
    console.log(wagers);
    let wager_data = [];
    let wager_tiles = document.querySelector('#wagers div').children;
    for (let tile of wager_tiles) {
        //console.log(tile);
        let fields = tile.querySelector('div').children;
        let value_field = fields[0].querySelector('input').value;
        let quantity_field = fields[1].querySelector('input').value;
        if (value_field && quantity_field) wager_data.push({
            value: value_field,
            quantity: quantity_field
        });
    }
    //console.log(wager_data);
    
    let total_wagers = 0;
    for (let wager of wager_data) total_wagers += parseInt(wager.quantity);
    //number of wagers must equal number of questions
    if (total_wagers != questions.questions.length) {
        console.log(`Incorrect number of wagers. Questions: ${questions.length}, Wagers: ${total_wagers}`);
        return;
    }
    document.querySelector('#total_wagers').innerHTML = total_wagers;
    let wagers_changed = JSON.stringify(wagers) != JSON.stringify(wager_data);
    console.log(wager_data);
    console.log('wagers changed: ' + wagers_changed);
    wagers = wager_data;
    //rebuild team wager chips if wagers are different
    if (wagers_changed) {
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
    }

    //write to wagers.json
    let data = new URLSearchParams();
    data.append('data', JSON.stringify(wagers));
    fetch(`${ROOT}php/write_wagers.php`, {
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
        //console.log(response);
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