$(function() {
    let operacje = [];
    let nastepneId = 1;
    $('#formularz').on('submit', function(event) {
        event.preventDefault();

        let opis = $('#opis').val().trim();
        let kwotaTekst = $('#kwota').val().trim().replace(',', '.');
        let kwota = Number(kwotaTekst);
        let poprawneDane = true;

        $('#opis, #kwota').removeClass('is-invalid');

        if (opis === '') {
            $('#opis').addClass('is-invalid');
            poprawneDane = false;
        }

        let poprawnyFormat = /^\d+(\.\d{1,2})?$/.test(kwotaTekst);

        if (!poprawnyFormat || !Number.isFinite(kwota) || kwota <= 0) {
            $('#kwota').addClass('is-invalid');
            poprawneDane = false;
        }

        if (!poprawneDane) {
            return;
        }

        let operacja = {
            id: nastepneId,
            opis: opis,
            kwota: kwota,
            typ: $('#typ').val(),
            kategoria: $('#kategoria').val()
        };

        operacje.push(operacja);
        nastepneId++;

        this.reset();
        console.log(operacje);
    });
});

