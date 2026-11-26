$(function() {
    let operacje = [];
    let nastepneId = 1;
    let edytowanaOperacja = null;
    //zapisywanie w localstorage
    function zapiszOperacje() {
        try {
            localStorage.setItem('operacjeBudzetu', JSON.stringify(operacje));
        } catch (blad) {
            console.warn('Nie udało się zapisać operacji.', blad);
        }
    }

    function wczytajOperacje() {
        try {
            let zapis = localStorage.getItem('operacjeBudzetu');

            if (zapis === null) {
                return;
            }

            let dane = JSON.parse(zapis);

            if (!Array.isArray(dane)) {
                return;
            }

            operacje = dane;

            for (let operacja of operacje) {
                nastepneId = Math.max(nastepneId, operacja.id + 1);
            }
        } catch (blad) {
            console.warn('Nie udało się wczytać operacji.', blad);
        }
    }
    //zakanczanie edycji
    function zakonczEdycje() {
        edytowanaOperacja = null;
        $('#formularz')[0].reset();
        $('#opis, #kwota').removeClass('is-invalid');
        $('#zapiszOperacje').text('Dodaj');
        $('#anulujEdycje').addClass('d-none');
    }
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
        let przyciskEdytuj = $('<button>')
        .attr('type', 'button')
        .attr('data-id', operacja.id)
        .addClass('btn btn-outline-primary btn-sm me-2 edytuj')
        .text('Edytuj');
        wiersz.append($('<td>').append(przyciskEdytuj, przyciskUsun));

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

        let typ = $('#typ').val();
        let kategoria = $('#kategoria').val();

        if (edytowanaOperacja === null) {
            operacje.push({
                id: nastepneId,
                opis: opis,
                kwota: kwota,
                typ: typ,
                kategoria: kategoria
            });

            nastepneId++;
        } else {
            edytowanaOperacja.opis = opis;
            edytowanaOperacja.kwota = kwota;
            edytowanaOperacja.typ = typ;
            edytowanaOperacja.kategoria = kategoria;
        }
        zapiszOperacje();
        zakonczEdycje();
        wyswietlOperacje();
        obliczPodsumowanie();
        wyswietlWydatkiKategorie();
        
    });
        $('#listaOperacji').on('click', '.usun', function() {
        let id = Number($(this).attr('data-id'));

        for (let i = 0; i < operacje.length; i++) {
            if (operacje[i].id === id) {
                if (operacje[i] === edytowanaOperacja) {
                    zakonczEdycje();
                }
                operacje.splice(i, 1);
                zapiszOperacje();
                wyswietlOperacje();
                obliczPodsumowanie();
                wyswietlWydatkiKategorie();
                break;
            }
        }
    });
        $('#listaOperacji').on('click', '.edytuj', function() {
        let id = Number($(this).attr('data-id'));

        for (let operacja of operacje) {
            if (operacja.id === id) {
                edytowanaOperacja = operacja;

                $('#opis').val(operacja.opis);
                $('#kwota').val(operacja.kwota.toFixed(2).replace('.', ','));
                $('#typ').val(operacja.typ);
                $('#kategoria').val(operacja.kategoria);

                $('#opis, #kwota').removeClass('is-invalid');
                $('#zapiszOperacje').text('Zapisz zmiany');
                $('#anulujEdycje').removeClass('d-none');
                $('#opis').trigger('focus');

                break;
            }
        }
    });

    $('#anulujEdycje').on('click', zakonczEdycje);
    wczytajOperacje();
    wyswietlOperacje();
    obliczPodsumowanie();
    wyswietlWydatkiKategorie();
});

