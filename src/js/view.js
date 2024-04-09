//variables
const REFRESH_TIME = 5;
var questions = {
    current: 1,
    shown: false,
    revealed: false,
    questions: []
};
var teams = {};

//set up refresh to read files every 5 seconds
let data_refresh = null;
if (!data_refresh) data_refresh = setInterval(refreshData, REFRESH_TIME*1000);

function refreshData() {
    //get teams.json
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
        //console.log(json);
        teams = json;
    });

    //get questions.json
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
        //console.log(json);
        questions = json;
    });

    rebuildTable();
    rebuildQuestion();
}

function rebuildTable() {
    let team_scores = [];
    for (let team in teams) {
        let total_points = 0;
        for (let wager of teams[team].wagers) {
            if (wager.correct) total_points += wager.value;
        }
        team_scores.push({
            team: team,
            points: total_points
        });
    }
    //sorted highest to lowest score
    team_scores.sort(compareScore);
    console.log(team_scores);
    //fill leaderboard
    let table_body = document.querySelector('#scoreboard_body');
    let table_body_html = ``;
    for (let i = 0; i<team_scores.length; i++) {
        table_body_html += `
        <tr>
            <th>${i+1}</th>
            <td>${team_scores[i].team}</td>
            <td>${team_scores[i].points}</td>
        </tr>
        `;
    }
    table_body.innerHTML = table_body_html;
}

function rebuildQuestion() {
    console.log(questions);
    let question_div = document.querySelector('#question_div');
    let answer_div = document.querySelector('#answer_div');
    //toggle question visibility
    if (questions.shown) {
        question_div.style.display = 'block';
    } else question_div.style.display = 'none';
    //toggle answer visibility
    if (questions.shown && questions.revealed) {
        answer_div.style.display = 'block';
    } else answer_div.style.display = 'none';

    question_div.innerHTML = `Q: ${questions.questions[parseInt(questions.current)-1].question}`;     //questionable code
    answer_div.innerHTML = `A: ${questions.questions[parseInt(questions.current)-1].answer}`;
}

function compareScore(teamB, teamA) {
    if (teamA.points < teamB.points)
       return -1;
    if (teamA.points > teamB.points)
      return 1;
    return 0;
  }
  
  //canvasObjects.sort(compare);