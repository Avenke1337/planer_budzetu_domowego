$(function() {
    let operacje = [];
    let nastepneId = 1;
    //wyswietlanie operacji
    function wyswietlOperacje() {
    $('#listaOperacji').empty();

    for (let operacja of operacje) {
        let wiersz = $('<tr>');
        let kategoria = $('#kategoria option[value="' + operacja.kategoria + '"]').text();
        let kwota = operacja.kwota.toFixed(2).replace('.', ',') + ' zł';

        let komorkaKwoty = $('<td>');

        if (operacja.typ === 'przychod') {
            komorkaKwoty.text('+ ' + kwota).addClass('text-success');
        } else {
            komorkaKwoty.text('- ' + kwota).addClass('text-danger');
        }

        let przyciskUsun = $('<button>')
            .attr('type', 'button')
            .attr('data-id', operacja.id)
            .addClass('btn btn-danger btn-sm usun')
            .text('Usuń');

        wiersz.append($('<td>').text(operacja.opis));
        wiersz.append($('<td>').text(kategoria));
        wiersz.append(komorkaKwoty);
        wiersz.append($('<td>').append(przyciskUsun));

        $('#listaOperacji').append(wiersz);
    }
}
    //dodawanie operacji, walidacja formularza (obsluga formularza ogolnie)
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
        wyswietlOperacje();
    });
        $('#listaOperacji').on('click', '.usun', function() {
        let id = Number($(this).attr('data-id'));

        for (let i = 0; i < operacje.length; i++) {
            if (operacje[i].id === id) {
                operacje.splice(i, 1);
                wyswietlOperacje();
                break;
            }
        }
    });
});

