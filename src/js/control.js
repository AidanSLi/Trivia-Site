//app.use(cors({ origin: true, credentials: true }));
header("Access-Control-Allow-Origin: *");

//controls setup
document.querySelector('#write_test_btn').onclick = writeJson;
document.querySelector('#read_test_btn').onclick = readJson;

async function writeJson() {
    let testObject = {
        teams: 2,
        round: 0
    }
    
}

async function readJson() {
    console.log('reading from teams.json...');
    const response = await fetch('../json/teams.json', {
        headers: {
            'Accept': 'application/json'
        }
    });
    const teams = await response.json();

    console.log(teams);
}


//FAKE