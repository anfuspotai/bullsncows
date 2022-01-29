var currentNumber = '1234'

document.addEventListener("DOMContentLoaded", function (event) {
    if (localStorage.currentNumber) currentNumber = localStorage.currentNumber
    if (localStorage.guessHistory) $('#guessHistory').html(localStorage.guessHistory)

    const boxInputs = document.querySelectorAll('#guessForm > *[id]');
    let guessBtn = document.getElementById('guessBtn')
    let guess1 = document.getElementById('first')
    let guess2 = document.getElementById('second')
    let guess3 = document.getElementById('third')
    let guess4 = document.getElementById('fourth')

    function getNumber() {
        fetch(`/getNumber`)
            .then((response) => response.json())
            .then((res) => {
                if (!res.ok) {
                    alert('Server unreachable')
                } else {
                    if (localStorage.currentNumber != res.currentNumber) {
                        localStorage.currentNumber = res.currentNumber
                        currentNumber = localStorage.currentNumber
                        localStorage.guessHistory = ''
                        localStorage.guesses = ''
                        localStorage.inputStatus = 'Enabled'
                        $('#guessHistory').html(``)
                    }
                }
            })
            .catch((err) => {
                console.log('Error fetching the number')
                console.log(err)
            });
    }


    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.encrypt) {
        try {
            console.log('Decrypting the number...');
            var decrypted = CryptoJS.enc.Base64.parse(params.encrypt).toString(CryptoJS.enc.Utf8);
            if (localStorage.currentNumber != decrypted && decrypted.length === 4) {
                localStorage.currentNumber = decrypted
                currentNumber = localStorage.currentNumber
                localStorage.guessHistory = ''
                localStorage.guesses = ''
                localStorage.inputStatus = 'Enabled'
                $('#guessHistory').html(``)
            }

        } catch (error) {
            console.log('Decrypting failed...');
            getNumber()

        }
    } else {
        console.log('Fetching data from server...');
        getNumber()
    }


    if (localStorage.inputStatus === 'Disabled') {
        $('.rounded').prop('disabled', true)
        let temp = currentNumber.split('')
        guess1.value = temp[0]
        guess2.value = temp[1]
        guess3.value = temp[2]
        guess4.value = temp[3]

    }


    function guessInput() {
        for (let i = 0; i < boxInputs.length; i++) {
            boxInputs[i].addEventListener('keydown', function (event) {
                if (event.key === "Backspace") {
                    boxInputs[i].value = '';
                    if (i !== 0) boxInputs[i - 1].focus();
                } else {
                    if (i === boxInputs.length - 1 && boxInputs[i].value !== '') {
                        event.preventDefault();
                        return true;
                    } else if ((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106)) {
                        boxInputs[i].value = event.key;
                        if (i !== boxInputs.length - 1) boxInputs[i + 1].focus();
                        // else $('#guessBtn').focus()
                        event.preventDefault();
                    } else if ((event.keyCode > 57 && event.keyCode < 91) || (event.keyCode > 105 && event.keyCode < 112)) {
                        event.preventDefault();
                        return true;
                    }
                }
            });
        }
    }
    guessInput();

    guessBtn.addEventListener('click', (event) => {
        event.preventDefault()

        let guessNum = `${guess1.value}${guess2.value}${guess3.value}${guess4.value}`

        if (guessNum === currentNumber) {

            $('#guessHistory').append(`<li class="text-success">${guessNum} : [Bulls - 4] <3 !!!</li>`)
            localStorage.guessHistory = $('#guessHistory').html()

            $('.rounded').prop('disabled', true)
            localStorage.inputStatus = 'Disabled'
            return successAlert('You Won')

        } else $('#guessForm').find('input').val('');

        $('#first').focus();

        if (guessNum === '' || guessNum.length !== 4) return failureAlert('Invalid Guess')
        const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
        if (toFindDuplicates(guessNum.split('')).length > 0) return failureAlert('Duplicate number found')

        if (localStorage.guesses) {
            let temp = JSON.parse(localStorage.guesses)
            if (temp.includes(guessNum))
                failureAlert("Try different number")
            else getHint(currentNumber, guessNum)
        } else getHint(currentNumber, guessNum)

    })

});

function saveGuesses(data) {
    let temp = [];
    if (localStorage.guesses)
        temp = JSON.parse(localStorage.guesses)
    temp.push(data);
    localStorage.guesses = JSON.stringify(temp);
}

var getHint = function (secret, guess) {
    let n = secret.length;
    let bulls = 0;
    let cows = 0;

    let secretDigitCount = {};
    let guessDigitCount = {};

    for (let i = 0; i < n; i++) {
        if (secret[i] == guess[i]) {
            bulls++;
        } else {
            secretDigitCount[secret[i]] = (secretDigitCount[secret[i]] || 0) + 1;
            guessDigitCount[guess[i]] = (guessDigitCount[guess[i]] || 0) + 1;
        }
    }

    for (let digit in secretDigitCount) {
        cows += Math.min(secretDigitCount[digit], (guessDigitCount[digit] || 0))
    }

    $('#guessHistory').append(`<li>${guess} : [Bulls - ${bulls}] [Cows - ${cows}] </li>`)
    localStorage.guessHistory = $('#guessHistory').html()
    saveGuesses(guess)
};

function toastNow(message, type = 'neutral') {

    let style = {
        'font-size': '1rem',
        'border-radius': '.7rem',
        'font-weight': '400'
    }
    if (type === 'success') style.background = '#27AE60'
    else if (type === 'fail') style.background = '#C0392B'

    Toastify({
        text: message,
        style,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: false,
    }).showToast();
}

function successAlert(message) {
    toastNow(message, 'success')
}

function failureAlert(message) {
    toastNow(message, 'fail')
}

function neutralAlert(message) {
    toastNow(message)
}