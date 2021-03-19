var express = require('express');
var router = express.Router();

const fs = require('fs');
const path = require('path');
const words_path = path.join(__dirname, '../helpers/words.txt');

const chunks = () => {
	let words = {};
	fs.readFile(words_path, 'utf8', (err, data)=> {
		if (err) {
			return console.log(err);
		}
		console.log(data);

		data.split('\n').map(async(line) => {
			console.log(line);
			words[line] = true;
		});
	});
	console.log('words ready!');
	return words;
};

const valid_words = chunks();

const scrabble_score = (word) => {
	const scores = {"a":1, "e":1, "i":1, "l":1, "n":1, "o":1, "r":1, "s":1, "t":1, "u":1,
					"d":2, "g":2, 
					"b":3, "c":3, "m":3, "p":3,
					"f":4, "h":4, "v":4, "w":4, "y":4,
					"k":5,
					"j":8, "x":8,
					"q":10, "z":10
					};
	let score = word
				.map(letter => scores[letter])
				.reduce((a,b)=> a + b, 0);

	return score;
}

const leadingZeros = (num, size) => {
    var s = "00" + num;
    return s.substr(s.length-size);
}

const sortWords = (dictionary) => {
	console.log(dictionary);
	let temp = {};
	let keys = Object.keys(dictionary)
		.map(key => {
			let newKey = leadingZeros(10 - dictionary[key],2) + key;
			temp[newKey] = {"key": key, "value": dictionary[key]};
			return newKey;
		});
	console.log([keys, temp]);
	keys.sort();
	console.log(['sorted', keys]);
	let sortedWords = keys.map(key => temp[key].key );
	console.log(['sorted words', sortedWords]);
	return sortedWords;
};


const find_words = (what) => {
	try{
	// permute chars and collect possible valid_words
	let possible = {};
	let letters = what.toLowerCase().split('');
	// scramble iteration
	var array = letters;
	for(let pivot=0; pivot<letters.length; pivot++) {
		console.log(['Round', pivot+1])
		for(let i = 0; i < letters.length; i++) {
			console.log(array);
			for (let j = array.length; j>0; j--) {
				let almost_word = array.map(lt => lt).splice(0, j);
				console.log(["almost_word", almost_word]);
				if (valid_words[almost_word.join('')]) {
					possible[almost_word.join('')] = scrabble_score(almost_word);
				}
			}
			console.log(['before shuffle', array]);
			// shuffle array
			if (pivot == 0) {
				let shuff = array.map(lt => lt).splice(pivot+1, array.length);
				shuff.push(array[pivot]);
				array = shuff;
			} else {
				let slice1 = array.map(lt => lt).splice(0, pivot);
				console.log(['slice1', slice1]);
				let pivot_char = array[pivot];
				console.log(['pivot', pivot_char]);
				let slice2 = array.map(lt => lt).splice(pivot+1, array.length);
				console.log(['slice2', slice2]);
				array = [pivot_char].concat(slice1.concat(slice2));
			}
			console.log(['after shuffle', array]);
		}
	}
	console.log(possible);

	return sortWords(possible);
	} catch(err) {
		console.log(err);
	}
	return "error";
};


/* GET users listing. */
router.get('/:letters', function(req, res, next) {
	let letters = req.params.letters;
	res.send(find_words(letters));
});

module.exports = router;
