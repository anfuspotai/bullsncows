var currentNumber = '1234'
localStorage.count = localStorage.count || 0

function info() {
    Swal.fire({
        title: 'How to play!',
        text: `Try to guess the number within 9 tries. \n
        If the matching digits are in their right positions, they are "bulls"🎯,\n
        if in different positions, they are "cows"🐮.`,
        icon: 'info',
        confirmButtonText: `Let's Play`
    })
}

function multiplayer() {
    Swal.fire({
        title: "Your challenge!",
        text: "You'll get an encrypted link to share via whatsapp",
        inputPlaceholder: "Write a non repeating 4 Digit number",
        input: 'number',
        showCancelButton: true,
        confirmButtonText: `Proceed`
    }).then((result) => {
        let theResult = result.value || '';
        const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
       
        if (theResult === '' || theResult.length !== 4)  failureAlert('Write a 4 digit number')
        else if (toFindDuplicates(theResult.split('')).length > 0)  failureAlert('Write non repeating digits..')
        else window.open(`/wa/${theResult}`,'_blank')
    }).catch(err => console.log(err))
}

if (!localStorage.firstTime) {
    info()
    localStorage.firstTime = true
}

document.addEventListener("DOMContentLoaded", function (event) {
    if (localStorage.currentNumber) currentNumber = localStorage.currentNumber
    if (localStorage.guessHistory) $('#guessHistory').html(localStorage.guessHistory)
    $('#first').focus();

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
                        localStorage.count = 0
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
                localStorage.count = 0
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
                        if (event.keyCode !== 13)
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

        let count = parseInt(localStorage.count)
        if (count > 9) {
            $('#guessHistory').prepend(`<li class="text-danger fw-bolder h3">${currentNumber} Better luck nt !!!</li>  `)
            localStorage.guessHistory = $('#guessHistory').html()

            $('.rounded').prop('disabled', true)
            localStorage.inputStatus = 'Disabled'

            return failureAlert('You have reached the maximum amount of tries')
        } else localStorage.count = count + 1

        let guessNum = `${guess1.value}${guess2.value}${guess3.value}${guess4.value}`

        if (guessNum === currentNumber) {

            $('#guessHistory').prepend(`<li class="text-success fw-bolder h3">${guessNum} : [🎯 - 4] <3 !!!</li>  `)
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

    $('#guessHistory').prepend(`<li class="fw-bold h5">${guess} : [🎯 - ${bulls}] [🐮 - ${cows}] </li>`)
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