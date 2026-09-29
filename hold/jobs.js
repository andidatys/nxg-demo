/* ============================================================
   Offene Positionen — die Daten und die drei Stellen, die sie zeigen.

   Briefing 4 verlangt /jobs mit Suche, Filter-Chips, Karten und einem
   gestalteten Leerzustand, dazu eine Detailseite und den Teaser auf der
   Startseite. Alle drei lesen dieselbe Liste, damit nichts auseinander
   laeuft.

   DIE POSITIONEN SIND BEISPIELDATEN. Sie stehen hier, damit Suche,
   Filter und Leerzustand echt zu sehen sind. Sobald NXG die Stellen
   liefert — aus dem eigenen System oder als Liste — wird nur dieses
   Array ersetzt; die Seiten bleiben, wie sie sind.
   ============================================================ */
(function () {
  'use strict';

  var AREAS = [
    { key: 'it',  name: 'IT' },
    { key: 'sap', name: 'SAP' },
    { key: 'fin', name: 'Finance' },
    { key: 'eng', name: 'Engineering' }
  ];

  /* Die Ansprechpartner sind dieselben vier wie im Team-Block: Name,
     Portrait und Durchwahl fehlen noch, der Platz dafuer steht. */
  var PEOPLE = {
    it:  { name: 'Name folgt', area: 'IT',          tel: '040 XXX XX‑11' },
    sap: { name: 'Name folgt', area: 'SAP',         tel: '040 XXX XX‑12' },
    fin: { name: 'Name folgt', area: 'Finance',     tel: '040 XXX XX‑13' },
    eng: { name: 'Name folgt', area: 'Engineering', tel: '040 XXX XX‑14' }
  };

  var JOBS = [
    {
      id: 'it-cloud-architect', area: 'it',
      t: 'Cloud Architect (m/w/d)',
      loc: 'Hamburg', mode: 'Festanstellung', sal: '95.000 – 115.000 €',
      lede: 'Ein Hamburger Mittelständler baut seine Plattform von zwei Rechenzentren in die Cloud um. Sie entscheiden, wie sie danach aussieht.',
      tasks: ['Zielarchitektur für AWS entwerfen und gegen den Betrieb verteidigen',
              'Migration in Wellen planen, mit dem Betrieb, nicht über ihn hinweg',
              'Infrastructure as Code als Standard etablieren'],
      profile: ['Mehrere Jahre Architekturarbeit in der Cloud, nicht nur im Konzept',
                'Kubernetes und Terraform aus eigener Hand',
                'Sie können einem Vorstand erklären, warum etwas drei Monate dauert']
    },
    {
      id: 'it-security-engineer', area: 'it',
      t: 'Security Engineer (m/w/d)',
      loc: 'Hamburg, hybrid', mode: 'Festanstellung', sal: '80.000 – 95.000 €',
      lede: 'Ein Logistikunternehmen holt die Sicherheit aus dem Projektgeschäft in ein festes Team. Sie sind die zweite Person darin.',
      tasks: ['Schwachstellen bewerten und die Behebung durchsetzen',
              'SIEM-Regeln schreiben, die niemand nach einer Woche abschaltet',
              'Entwicklungsteams begleiten, statt ihnen hinterherzuräumen'],
      profile: ['Erfahrung im Betrieb, nicht nur im Audit',
                'Linux und Netzwerke auf Kommandozeilenniveau',
                'Ruhe, wenn es laut wird']
    },
    {
      id: 'sap-fico-berater', area: 'sap',
      t: 'SAP FI/CO Berater (m/w/d)',
      loc: 'Hamburg', mode: 'Festanstellung', sal: '85.000 – 105.000 €',
      lede: 'S/4HANA steht an, der Kunde will die Umstellung mit eigenen Leuten machen. Sie sind der Kopf im Finanzteil.',
      tasks: ['Module FI und CO betreuen und für S/4HANA vorbereiten',
              'Fachbereich und Entwicklung übersetzen, in beide Richtungen',
              'Teilprojekte führen, ohne den Tagesbetrieb abzuhängen'],
      profile: ['Mehrere volle Projektzyklen in FI/CO',
                'Customizing selbst gemacht, nicht nur beauftragt',
                'Erste S/4HANA-Berührung genügt']
    },
    {
      id: 'sap-abap-entwickler', area: 'sap',
      t: 'SAP ABAP Entwickler (m/w/d)',
      loc: 'Hamburg, 2 Tage remote', mode: 'Festanstellung', sal: '75.000 – 90.000 €',
      lede: 'Ein Handelsunternehmen räumt zwanzig Jahre gewachsene Eigenentwicklung auf — mit einem Plan, nicht mit einem Rewrite.',
      tasks: ['Bestehende Entwicklungen analysieren und auf ABAP OO heben',
              'Schnittstellen zu Vorsystemen stabil halten',
              'Code Reviews im Team etablieren'],
      profile: ['ABAP OO, CDS Views, ALV aus dem Alltag',
                'Sie lesen fremden Code lieber, als ihn wegzuwerfen',
                'Deutsch verhandlungssicher']
    },
    {
      id: 'fin-bilanzbuchhalter', area: 'fin',
      t: 'Bilanzbuchhalter (m/w/d)',
      loc: 'Hamburg', mode: 'Festanstellung', sal: '65.000 – 78.000 €',
      lede: 'Mittelständische Unternehmensgruppe, sechs Gesellschaften, ein Abschluss. Die Stelle wird frei, weil jemand in die Leitung rückt.',
      tasks: ['Monats- und Jahresabschlüsse nach HGB',
              'Konten abstimmen, Rückstellungen bewerten',
              'Ansprechpartner für Wirtschaftsprüfer und Steuerberatung'],
      profile: ['Geprüfte Bilanzbuchhaltung oder vergleichbar',
                'DATEV oder SAP FI, je nach Herkunft',
                'Sie mögen es, wenn Zahlen am Ende stimmen']
    },
    {
      id: 'fin-controller', area: 'fin',
      t: 'Controller (m/w/d)',
      loc: 'Hamburg, hybrid', mode: 'Festanstellung', sal: '70.000 – 85.000 €',
      lede: 'Das Unternehmen wächst schneller als seine Zahlen erklären können. Sie bauen das Berichtswesen, das dem Wachstum folgt.',
      tasks: ['Forecast und Planung aufsetzen und pflegen',
              'Kennzahlen bauen, die im Management auch benutzt werden',
              'Investitionen rechnen, bevor sie entschieden sind'],
      profile: ['Studium mit Schwerpunkt Controlling oder Finance',
                'Excel weit über Summenfunktionen hinaus, BI von Vorteil',
                'Sie sagen auch dann etwas, wenn das Ergebnis unbequem ist']
    },
    {
      id: 'eng-konstrukteur', area: 'eng',
      t: 'Konstrukteur (m/w/d)',
      loc: 'Umland Hamburg', mode: 'Festanstellung', sal: '62.000 – 74.000 €',
      lede: 'Sondermaschinenbau, Losgröße eins. Jede Konstruktion ist ein Unikat, und jede steht später auf einem Hallenboden.',
      tasks: ['Baugruppen in SolidWorks konstruieren',
              'Fertigung früh einbeziehen, statt sie zu überraschen',
              'Stücklisten und Dokumentation pflegen'],
      profile: ['Maschinenbau-Studium oder Techniker',
                'Erfahrung im Sondermaschinenbau',
                'Sie waren schon mal in der Werkstatt, als es klemmte']
    },
    {
      id: 'eng-projektleiter-automation', area: 'eng',
      t: 'Projektleiter Automatisierung (m/w/d)',
      loc: 'Hamburg', mode: 'Festanstellung', sal: '80.000 – 95.000 €',
      lede: 'Anlagenbauer mit internationalen Projekten sucht jemanden, der Termine hält, ohne die Technik zu verbiegen.',
      tasks: ['Automatisierungsprojekte von der Spezifikation bis zur Abnahme führen',
              'Lieferanten und Nachunternehmer steuern',
              'Inbetriebnahmen vor Ort begleiten'],
      profile: ['Elektrotechnik oder Automatisierungstechnik',
                'SPS-Welt vertraut, Siemens bevorzugt',
                'Reisebereitschaft, in Wellen, nicht dauerhaft']
    }
  ];

  /* ---------------------------------------------------------- helpers */
  function areaName(key) {
    for (var i = 0; i < AREAS.length; i++) {
      if (AREAS[i].key === key) { return AREAS[i].name; }
    }
    return '';
  }
  function byId(id) {
    for (var i = 0; i < JOBS.length; i++) {
      if (JOBS[i].id === id) { return JOBS[i]; }
    }
    return null;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function li(items) {
    return items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }

  /* ---------------------------------------------------------- teaser */
  var teaser = document.querySelector('[data-jobs-teaser]');
  if (teaser) {
    teaser.innerHTML = JOBS.slice(0, 3).map(function (j) {
      return '<li><a href="job.html?id=' + j.id + '">' +
             '<span class="jteaser__t">' + esc(j.t) + '</span>' +
             '<span class="jteaser__m">' + esc(areaName(j.area)) + ' · ' + esc(j.loc) + ' · ' + esc(j.sal) + '</span>' +
             '<i aria-hidden="true">→</i></a></li>';
    }).join('');
  }

  /* ---------------------------------------------------------- list */
  var list = document.querySelector('[data-jobs-list]');
  if (list) {
    var chipRow = document.querySelector('[data-jobs-chips]');
    var search = document.getElementById('job-q');
    var count = document.querySelector('[data-jobs-count]');
    var state = { area: 'all', q: '' };

    var params = new URLSearchParams(location.search);
    var wanted = params.get('fb');
    if (wanted && areaName(wanted)) { state.area = wanted; }

    if (chipRow) {
      chipRow.innerHTML =
        '<button type="button" class="chip" data-area="all" aria-pressed="false">Alle</button>' +
        AREAS.map(function (a) {
          return '<button type="button" class="chip" data-area="' + a.key + '" aria-pressed="false">' + a.name + '</button>';
        }).join('');
    }

    function matches(j) {
      if (state.area !== 'all' && j.area !== state.area) { return false; }
      if (!state.q) { return true; }
      var hay = (j.t + ' ' + j.loc + ' ' + areaName(j.area) + ' ' + j.lede).toLowerCase();
      return hay.indexOf(state.q) > -1;
    }

    function render() {
      var hits = JOBS.filter(matches);

      if (chipRow) {
        [].forEach.call(chipRow.querySelectorAll('.chip'), function (c) {
          c.setAttribute('aria-pressed', c.getAttribute('data-area') === state.area ? 'true' : 'false');
        });
      }
      if (count) {
        count.textContent = hits.length === 1 ? '1 Position' : hits.length + ' Positionen';
      }

      if (!hits.length) {
        /* Briefing 4: eine leere Liste wird nie ausgeliefert. Wer nichts
           findet, bekommt den zweiten Weg angeboten. */
        list.innerHTML =
          '<li class="jobs__empty">' +
          '<h3>Hier ist gerade nichts dabei.</h3>' +
          '<p>Die meisten Positionen besprechen wir, bevor sie eine Anzeige werden. Schicken Sie uns Ihr Profil — wir melden uns, wenn etwas passt.</p>' +
          '<div class="jobs__emptycta">' +
          '<a class="btn btn--solid" href="kontakt.html?anliegen=kandidat">Profil senden <i aria-hidden="true">→</i></a>' +
          '<button type="button" class="btn btn--ghost" data-jobs-reset>Filter zurücksetzen <i aria-hidden="true">→</i></button>' +
          '</div></li>';
        return;
      }

      list.innerHTML = hits.map(function (j) {
        return '<li class="jobs__card"><a href="job.html?id=' + j.id + '">' +
               '<span class="jobs__t">' + esc(j.t) + '</span>' +
               '<span class="jobs__meta"><span>' + esc(j.loc) + '</span>' +
               '<span>' + esc(j.sal) + '</span>' +
               '<span class="jobs__area">' + esc(areaName(j.area)) + '</span></span>' +
               '<span class="jobs__go">Details ansehen <i aria-hidden="true">→</i></span>' +
               '</a></li>';
      }).join('');
    }

    if (chipRow) {
      chipRow.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) { return; }
        state.area = chip.getAttribute('data-area');
        render();
      });
    }
    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value.trim().toLowerCase();
        render();
      });
    }
    list.addEventListener('click', function (e) {
      if (e.target.closest('[data-jobs-reset]')) {
        state.area = 'all';
        state.q = '';
        if (search) { search.value = ''; }
        render();
        if (search) { search.focus(); }
      }
    });

    render();
  }

  /* ---------------------------------------------------------- detail */
  var detail = document.querySelector('[data-job-detail]');
  if (detail) {
    var job = byId(new URLSearchParams(location.search).get('id') || '');

    if (!job) {
      detail.innerHTML =
        '<div class="job__gone"><h1>Diese Position gibt es nicht mehr.</h1>' +
        '<p>Vielleicht ist sie besetzt, vielleicht stimmt der Link nicht. Beides lässt sich klären.</p>' +
        '<div class="jobs__emptycta">' +
        '<a class="btn btn--solid" href="jobs.html">Alle Positionen <i aria-hidden="true">→</i></a>' +
        '<a class="btn btn--ghost" href="kontakt.html?anliegen=kandidat">Vertraulich anfragen <i aria-hidden="true">→</i></a>' +
        '</div></div>';
      return;
    }

    var p = PEOPLE[job.area];
    document.title = job.t + ' — NXG GmbH, Hamburg';

    detail.innerHTML =
      '<div class="job__main">' +
        '<p class="eyebrow"><i aria-hidden="true"></i>' + esc(areaName(job.area)) + '</p>' +
        '<h1>' + esc(job.t) + '</h1>' +
        '<ul class="job__facts">' +
          '<li><span>Standort</span><b>' + esc(job.loc) + '</b></li>' +
          '<li><span>Anstellung</span><b>' + esc(job.mode) + '</b></li>' +
          '<li><span>Gehaltsrahmen</span><b>' + esc(job.sal) + '</b></li>' +
        '</ul>' +
        '<p class="job__lede">' + esc(job.lede) + '</p>' +
        '<h2>Ihre Aufgaben</h2><ul class="job__list">' + li(job.tasks) + '</ul>' +
        '<h2>Ihr Profil</h2><ul class="job__list">' + li(job.profile) + '</ul>' +
        '<h2>Der Weg zu uns</h2>' +
        '<p class="job__lede">Ein Gespräch, in dem wir Ihnen sagen, wer das Unternehmen ist. Danach entscheiden Sie, ob wir Sie vorstellen. Ohne Ihre Zustimmung geht kein Profil raus.</p>' +
      '</div>' +
      '<aside class="job__side" aria-label="Ansprechpartner">' +
        '<div class="job__card">' +
          '<span class="job__img team__img--ph" aria-hidden="true">Foto folgt</span>' +
          '<p class="job__who">Ihr Ansprechpartner</p>' +
          '<b class="team__name" data-name>' + esc(p.name) + '</b>' +
          '<span class="team__area">' + esc(p.area) + '</span>' +
          '<a class="team__tel" data-tel href="tel:+4940XXXXXX' + p.tel.slice(-2) + '">' + esc(p.tel) + '</a>' +
          '<div class="job__cta">' +
            '<a class="btn btn--solid" href="kontakt.html?anliegen=kandidat&amp;fachbereich=' + job.area + '">Jetzt bewerben <i aria-hidden="true">→</i></a>' +
            '<a class="btn btn--ghost" href="kontakt.html?anliegen=kandidat">Vertraulich anfragen <i aria-hidden="true">→</i></a>' +
          '</div>' +
        '</div>' +
      '</aside>';
  }
})();
