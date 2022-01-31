var express = require('express');
var router = express.Router();
const fs = require('fs').promises;
const CryptoJS = require('crypto-js');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index')
});

router.get('/challenge', function (req, res, next) {
  res.render('challenge')
});

router.get('/mp/:mp', function (req, res, next) {
  let params = req.params.mp

  if (!params || params.length !== 4) return res.redirect(`/`)

  const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
  if (toFindDuplicates(params.split('')).length > 0) return res.redirect(`/`)

  let encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(params));
  res.redirect(`/challenge?encrypt=${encrypted}`)
});

router.get('/wa/:mp', function (req, res, next) {
  let params = req.params.mp

  if (!params || params.length !== 4) return res.redirect(`/`)

  const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
  if (toFindDuplicates(params.split('')).length > 0) return res.redirect(`/`)

  let encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(params));
  res.redirect(`https://wa.me/?text=https://bulls.anfus.xyz/challenge?encrypt=${encrypted}`)
});

router.get('/getNumber', async function (req, res, next) {
  try {
    var data = await fs.readFile('theNumber.txt', 'utf8');
    console.log(data)
    res.json({
      ok: true,
      currentNumber: data.toString()
    });
  } catch (e) {
    res.json({
      ok: true,
      currentNumber: '1234'
    });
  }
});

router.get('/changeNumber', async function (req, res, next) {

  try {
    if (req.query.manualNumber && req.query.manualNumber.length === 4) {

      const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
      if (toFindDuplicates(guessNum.split('')).length === 0) {
        await fs.writeFile('theNumber.txt', req.query.manualNumber);
        res.redirect('/');
      } else res.redirect('/');

    } else {
      let theNumbers = [];
      let n, p;
      let min = 0;
      let max = 9;
      let r = 4;

      for (let i = 0; i < r; i++) {
        do {
          n = Math.floor(Math.random() * (max - min + 1)) + min;
          p = theNumbers.includes(n);
          if (!p) {
            theNumbers.push(n);
          }
        }
        while (p);
        if (i === r - 1) {
          await fs.writeFile('theNumber.txt', theNumbers.join(''));
          res.redirect('/');
        }
      }
    }
  } catch (e) {
    res.redirect('/');
  }
});



module.exports = router;