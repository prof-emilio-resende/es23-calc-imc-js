//------------------------ declaracao de estruturas ------------------------
function Person(height, weight) {
    if (typeof(height) !== 'number' || isNaN(height))
        throw Error('height not a number');

    if (typeof(weight) !== 'number' || isNaN(weight))
        throw Error('weight not a number');

    this.height = height;
    this.weight = weight;
}

function Dietician(height, weight, crn) {
    Person.call(this, height, weight);
    this.crn = crn;
    this.calculateImc = function(onSucess) {
        return calculateImcApi(this, onSucess);
    }
    console.log(this);
}
Dietician.prototype = Object.create(Person.prototype);
Dietician.prototype.constructor = Dietician;

function Athlete(height, weight, crn) {
    Dietician.call(this, height, weight, crn);
    this.calculateDiet = function(onSuccess) {
        this.calculateImc(function(res) {
            var imc = res['imc']
            if (imc > 30) {
                onSuccess("Ultra leve");
            } else {
                onSuccess("Normal");
            }
        });
    }
}
Athlete.prototype = Object.create(Dietician);
Athlete.prototype.constructor = Athlete;

//------------------------ funções de negocios ------------------------

function buildCalculateImc() {
    console.log('construindo a função de onload...');
    var alturaEl = document.querySelector('#altura');
    var pesoEl = document.querySelector('#peso');
    var imcEl = document.querySelector('#imc');
    var dietEl = document.querySelector('#diet');

    return function() { //ANONYM2
        console.log('executando a função de onload...');
        var height = parseFloat(alturaEl.value);
        var weight = parseFloat(pesoEl.value);
        new Dietician(height, weight, 1234).calculateImc(function(res) { imcEl.innerHTML = res['imc'] });
        new Athlete(height, weight, 1234).calculateDiet(function(res) { dietEl.innerHTML = res });
    }    
}


//------------------------ funções de AJAX ------------------------
function createRequest() {
    var req = null;
    try {
        req = new XMLHttpRequest();
    } catch ( tryMS ) {
        try {
            req = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (otherMS) {
            try {
                req = new ActiveXObject('Microsoft.XMLHTTP');
            } catch ( failed ) {
                console.error('Nao foi possivel criar a requisicao...');
            }
        }
    }

    return req;
}

function loadTable() {
    var request = createRequest();
    if (request == null) return null;

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                var table = document.querySelector('#table-imc');

                Object.keys(response)
                    .sort()
                    .forEach(function(key) {
                        var newRow = table.insertRow(-1);
                        var keyCell = newRow.insertCell(0);
                        var keyText = document.createTextNode(key);
                        keyCell.appendChild(keyText);

                        var valCell = newRow.insertCell(1);
                        var valText = document.createTextNode(response[key]);
                        valCell.appendChild(valText);
                    });
            }
        }
    }

    var url = 'http://localhost:8080/imc/table';
    request.open('GET', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
}

function calculateImcApi(person, onSuccess) {
    var request = createRequest();
    if (request == null) return null;

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                onSuccess(JSON.parse(this.responseText));
            }
        }
    }

    request.open('POST', 'http://localhost:8080/imc/calculate', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        'height': person.height,
        'weight': person.weight
    }))
}


//------------------------ inicializador ------------------------

window.onload = function(evt) { //ANONYM1
    console.log('carregando página...');
    var btn = document.querySelector(".form button");
    btn.addEventListener("click", buildCalculateImc());

    loadTable();
}
