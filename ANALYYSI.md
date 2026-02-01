### 1. Mitä tekoäly teki hyvin? ###

 Olen toteuttanut useamman kokeiluprojektin LLM avustuksella, ja olen hämmästynyt, kuinka vaivattomasti tämä projekti muotoutui toimivaksi tuotteeksi. Panostin merkittävästi tekoälyn pohjustukseen: käytin Google Geminiä luomaan ja jäsentelemään erinomaiset vaiheittaiset ohjeet Claude Codea varten. Koska tiesin Clauden suosivan vanhempaa Prisma 6.0 -versiota, käytin Prisman omaa MCP-palvelinta varmistaakseni, että projekti hyödyntää uusinta 7.0-dokumentaatiota. Tekoäly suoriutui koodin arkkitehtuurista (route, controller, service -jako) erittäin hyvin ilman manuaalista korjaustarvetta. Claude tuotti myös erittäin kattavat yksikkötestit. 

### 2. Mitä tekoäly teki huonosti? ###

Kielimallien kanssa sanavalinnat on kriittisiä: alustuksessa tehdyt pienet epätarkkuudet voivat kertautua myöhemmin. Mainitsin alussa tekeväni vain pienimuotoista Proof of Concept (PoC) -tuotetta, josta seurasi se että osa valinnoista ei ole helposti laajennettavissa. Reititykset olivat pelkistettyjä (esim. /booking tai /rooms), jolloin toiminto piti päätellä pelkästään HTTP-metodista (GET/POST). Olisi kannattanut määritellä heti alussa selkeä nimeämiskäytäntö, kuten "toimintapohjainen" API (esim. /api/booking/create). Tähän päälle olisi sitten helppo vaikka lisätä kirjautumiset ja koodi pysyisi helopommin luettavana. 

Huomasin myös, että mallit (kuten Gemini ja GPT) ovat hyvin liiketoimintasuuntautuneita ja lisäävät hanakasti hinnoittelu- ja maksuominaisuuksia koodiin ilman erillistä pyyntöä. Tarkemmalla promptauksella tämänkin ongelman saisi selätettyä.

### 3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi? ###

* Testien aikariippuvuudet: Lisäsin testeihin ns. "mock-ajan" (time freeze) ylläpidettävyyden parantamiseksi. Kiinteät tulevaisuuden päivämäärät toimivat hetken, mutta aiheuttavat testien kaatumisen ajan kuluessa.
* Validointi: Määrittelyjen mukaan varauksia ei saa tehdä menneisyyteen. Lisäsin tämän validoinnin varmistaakseni vaatimusten täyttymisen.
* Testidata: Lisäsin Seed-tiedoston tietokannan alustamista varten, jotta testausta ei tarvitse aloittaa tyhjästä.
* Dokumentaatio/Työkalut: Lisäsin Postman-kokoelman peruskutsuineen helpottaakseni API:n käyttöä ja testausta.

