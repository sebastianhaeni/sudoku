var grid = [];
Math.seedrandom();
var seed = Math.random();

$(document).ready(function () {
    var assignments = 22;

    var seedSet = false;
    var params = window.location.search.replace("?", "").split('&');
    $.each(params, function (i, param) {
        var parts = param.split('=');
        if (parts[0] === 'seed') {
            seed = parts[1];
            seedSet = true;
        } else if (parts[0] === 'difficulty') {
            switch (parts[1]) {
                case 'easy':
                    assignments = 33;
                    break;
                case 'medium':
                    assignments = 25;
                    break;
                case 'hard':
                    assignments = 20;
                    break;
                default:
                    assignments = parts[1];
            }
        }
    });
    if (!seedSet) {
        window.location = '.?seed=' + seed + '&difficulty=' + assignments;
        return;
    }
    Math.seedrandom(seed + assignments);
    seed = Math.random();

    createTable();
    var creationFails = 0;
    while (!createPuzzle(seed, assignments)) {
        Math.seedrandom(seed);
        seed = Math.random() * 100000;
        creationFails++;
        if (creationFails > 400) {
            Math.seedrandom();
            window.location = '.?seed=' + Math.random() + '&difficulty=' + assignments;
            return;
        }
    }
    createInputs();
});

function createTable() {
    for (var y = 1; y <= 9; y++) {
        $('#sudoku > tbody').append('<tr></tr>');
        grid[y] = [];
        for (var x = 1; x <= 9; x++) {
            $('#sudoku tr:nth-child(' + y + ')').append('<td></td>');
            grid[y][x] = 0;
        }
    }
}

function createPuzzle(seed, assignments) {
    for (var y = 1; y <= 9; y++) {
        for (var x = 1; x <= 9; x++) {
            Math.seedrandom(seed * x * y);
            value = Math.round(Math.random() * 8) + 1;
            var invalidCount = 0;
            while (!isValid(x, y, value)) {
                invalidCount++;
                value++;
                if (value > 9) {
                    value = 1;
                }
                if (invalidCount > 8) {
                    return false;
                }
            }
            grid[y][x] = value;
        }
    }
    for (var i = 0; i < assignments; i++) {
        Math.seedrandom(seed * ("" + i).hashCode());
        var xa = Math.round(Math.random() * 8) + 1;
        Math.seedrandom(seed * 2 * ("" + i).hashCode());
        var ya = Math.round(Math.random() * 8) + 1;

        if ($('#sudoku tr:nth-child(' + ya + ') td:nth-child(' + xa + ') input').length > 0) {
            assignments++;
        } else {
            $('#sudoku tr:nth-child(' + ya + ') td:nth-child(' + xa + ')').html('<input type="text" disabled value="' + grid[ya][xa] + '"/>');
        }
    }
    return true;
}

function createInputs() {
    $('#sudoku td').each(function (i, cell) {
        if ($(cell).html() === '') {
            $(cell).append('<input type="text" oninput="validateCells();" maxlength="1" />');
        }
    });
}

function validateCells() {
    $('#sudoku input').each(function (i, input) {
        validateCell(input);
    });
}

function validateCell(input) {
    var value = $(input).val();

    if (value === '') {
        $(input).parent().removeClass('invalid');
        return;
    }

    if (isNaN(parseInt(value)) || parseInt(value) < 1 || parseInt(value) > 9) {
        $(input).parent().addClass('invalid');
        return;
    }

    var x = $(input).parent().index() + 1;
    var y = $(input).parent().parent().index() + 1;

    if (!isValidInput(x, y, value)) {
        $(input).parent().addClass('invalid');
    } else {
        $(input).parent().removeClass('invalid');
    }

    validateSolution();
}

function isValidInput(x, y, value) {
    var isValid = true;

    $('#sudoku tr:nth-child(' + y + ') td input').each(function (i, item) {
        if ($(item).val() === value && x - 1 !== i) {
            isValid = false;
            return false;
        }
    });
    if (!isValid) return false;

    $('#sudoku tr td:nth-child(' + x + ') input').each(function (i, item) {
        if ($(item).val() === value && y - 1 !== i) {
            isValid = false;
            return false;
        }
    });

    if (!isValid) return false;

    return validateInputSquare(x, y, value);
}

function validateInputSquare(x, y, value) {
    var xStart = 1;
    if (between(x, 4, 6)) xStart = 4;
    if (between(x, 7, 9)) xStart = 7;

    var yStart = 1;
    if (between(y, 4, 6)) yStart = 4;
    if (between(y, 7, 9)) yStart = 7;

    for (var sy = yStart; sy < yStart + 3; sy++) {
        for (var sx = xStart; sx < xStart + 3; sx++) {
            if (sy !== y && sx !== x && $('#sudoku tr:nth-child(' + sy + ') td:nth-child(' + sx + ') input').val() === value) {
                return false;
            }
        }
    }
    return true;
}

function validateSolution() {
    var solved = true;
    $('#sudoku input').each(function (i, input) {
        if ($(input).val() === '' || $(input).parent().hasClass('invalid')) {
            solved = false;
            return false;
        }
    });
    if (solved) {
        $("#sudoku-solved").fadeIn('slow');
    }
}

function isValid(x, y, value) {
    for (var sy = 1; sy <= 9; sy++) {
        if (grid[sy][x] === value && sy !== y) {
            return false;
        }
    }

    for (var sx = 1; sx <= 9; sx++) {
        if (grid[y][sx] === value && sx !== x) {
            return false;
        }
    }

    return validateSquare(x, y, value);
}

function validateSquare(x, y, value) {
    var xStart = 1;
    if (between(x, 4, 6)) xStart = 4;
    if (between(x, 7, 9)) xStart = 7;

    var yStart = 1;
    if (between(y, 4, 6)) yStart = 4;
    if (between(y, 7, 9)) yStart = 7;

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (grid[yStart + i][xStart + j] === value && yStart + i !== y && xStart + j !== x) {
                return false;
            }
        }
    }

    return true;
}

function between(val, min, max) {
    return val >= min && val <= max;
}

String.prototype.hashCode = function () {
    var hash = 0, i, l, char;
    if (this.length === 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


