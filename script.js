$(function() {
    let operacje = [];
    let nastepneId = 1;
    $('#filtrKategorii').append($('#kategoria option').clone());
    $('#filtrKategorii').val('');

    $('#filtrTypu, #filtrKategorii, #sortowanie').on('change', function() {
        wyswietlOperacje();
    });
    //wyswietlanie operacji
    function wyswietlOperacje() {
    $('#listaOperacji').empty();
    let filtrTypu = $('#filtrTypu').val();
    let filtrKategorii = $('#filtrKategorii').val();
    //sortowanie operacji (rosnaco/malejaco)
    let sortowanie = $('#sortowanie').val();
    let operacjeDoWyswietlenia = operacje.slice();

    if (sortowanie === 'rosnaco') {
        operacjeDoWyswietlenia.sort(function(a, b) {
            return a.kwota - b.kwota;
        });
    } else if (sortowanie === 'malejaco') {
        operacjeDoWyswietlenia.sort(function(a, b) {
            return b.kwota - a.kwota;
        });
    }

    for (let operacja of operacjeDoWyswietlenia) {
        if (filtrTypu !== '' && operacja.typ !== filtrTypu) {
            continue;
        }

        if (filtrKategorii !== '' && operacja.kategoria !== filtrKategorii) {
            continue;
        }
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
    //saldo
    function obliczPodsumowanie() {
    let przychody = 0;
    let wydatki = 0;

    for (let operacja of operacje) {
        let grosze = Math.round(operacja.kwota * 100);

        if (operacja.typ === 'przychod') {
            przychody += grosze;
        } else {
            wydatki += grosze;
        }
    }

    let saldo = przychody - wydatki;

    $('#sumaPrzychodow').text((przychody / 100).toFixed(2).replace('.', ',') + ' zł');
    $('#sumaWydatkow').text((wydatki / 100).toFixed(2).replace('.', ',') + ' zł');
    $('#saldo').text((saldo / 100).toFixed(2).replace('.', ',') + ' zł');

    $('#saldo').removeClass('text-success text-danger');

    if (saldo > 0) {
        $('#saldo').addClass('text-success');
    } else if (saldo < 0) {
        $('#saldo').addClass('text-danger');
    }
}
    //wyswietlanie wydatkow w procentach i podzielone na kategorie
    function wyswietlWydatkiKategorie() {
    let sumaWydatkow = 0;
    let sumyKategorii = {};

    for (let operacja of operacje) {
        if (operacja.typ === 'wydatek') {
            let grosze = Math.round(operacja.kwota * 100);
            let kategoria = operacja.kategoria;

            if (sumyKategorii[kategoria] === undefined) {
                sumyKategorii[kategoria] = 0;
            }

            sumyKategorii[kategoria] += grosze;
            sumaWydatkow += grosze;
        }
    }

    $('#wydatkiKategorie').empty();

    if (sumaWydatkow === 0) {
        $('#wydatkiKategorie').append($('<p>').text('Brak wydatków.'));
        return;
    }

    $('#kategoria option').each(function() {
        let grosze = sumyKategorii[$(this).val()];

        if (grosze === undefined) {
            return;
        }

        let procent = grosze / sumaWydatkow * 100;
        let kwota = (grosze / 100).toFixed(2).replace('.', ',') + ' zł';
        let procentTekst = procent.toFixed(1).replace('.', ',') + '%';

        let opis = $('<div>').text($(this).text() + ' — ' + kwota + ' (' + procentTekst + ')');
        let pasek = $('<div>').addClass('progress-bar').css('width', procent + '%');
        let tloPaska = $('<div>').addClass('progress mb-3')
            .attr('aria-hidden', 'true')
            .append(pasek);

        $('#wydatkiKategorie').append(opis, tloPaska);
    });
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
        obliczPodsumowanie();
        wyswietlWydatkiKategorie();
        
    });
        $('#listaOperacji').on('click', '.usun', function() {
        let id = Number($(this).attr('data-id'));

        for (let i = 0; i < operacje.length; i++) {
            if (operacje[i].id === id) {
                operacje.splice(i, 1);
                wyswietlOperacje();
                obliczPodsumowanie();
                wyswietlWydatkiKategorie();
                break;
            }
        }
    });
});

