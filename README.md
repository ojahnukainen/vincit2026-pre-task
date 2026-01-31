# Vincit esitehtävä 2026

### Johdanto
Projektin tarkoituksena on tutustua LLM:ien mahdollisuuksiin toimia juniorikehittäjänä. Kun tekoäly oli luonut toimivan pohjan, tein projektiin muutoksia ja korjauksia, jotta se vastaisi paremmin annettuja vaatimuksia. Tehtävässä on hyödynnetty sekä Google Geminiä että Claude Codea.

### Projektin ominaisuudet
Sovellus tarjoaa rajapinnan seuraaviin toimintoihin:
* **Käyttäjät:** Luonti, päivitys, poisto ja haku.
* **Huoneet:** Luonti, päivitys, poisto ja haku.
* **Varaukset:**
    * Huoneen varaaminen vapaana aikana.
    * Validointi: Estää päällekkäiset varaukset ja menneisyyteen kohdistuvat varaukset.

### Asennusohjeet
**Esivaatimukset:** [Node.js](https://nodejs.org/) tulee olla asennettuna.

1. Kloonaa repositorio: 
    ```bash
    git clone https://github.com/ojahnukainen/vincit2026-pre-task
    ```
2. Asenna riippuvuudet:
    ```bash
    npm install
    ```
3. Luo ja kopioi tietokannan lokaatio .env tiedostoon
   ```bash
    echo "DATABASE_URL='file:./dev.db'" >> .env
    ``` 
4. Luodaan prisma tiedostot
    ```bash
    npx prisma generate
    ```
5. Alusta tietokanta:
    ```bash
    npx prisma migrate dev
    ```
6. Lisää testidataa (Seeding) Tietokannan täyttäminen tekee testaamisesta mielkkäämpää:
    ```bash
    npx prisma db seed
    ```

### Käyttö
1. Käynnistä sovellus:
    ```bash
    npm run start
    ```
2. API toimii portissa 3000.
3. Testaus Postmanilla Repositorion juuresta löytyy valmis Postman-kokoelma (JSON), joka sisältää valmiit API-kutsut testausta varten.

### API Endpoints
| HTTP Verb | Endpoint | Toiminto |
| --- | --- | --- |
| POST | /user | Luo uusi käyttäjä |
| GET | /user | Hae kaikki käyttäjät |
| GET | /user/:id | Hae yksittäinen käyttäjä ID:n perusteella |
| PUT | /user/:id | Päivitä yksittäinen käyttäjä ID:n perusteella |
| DELETE | /user/:id | Poista yksittäinen käyttäjä ID:n perusteella |
|  |  |  |
| Room | --- | --- |
| POST | /room | Luo uusi huone |
| GET | /room | Hae kaikki huoneet |
| GET | /room/:id | Hae yksittäinen huone ID:n perusteella |
| PUT | /room/:id | Päivitä yksittäinen huone ID:n perusteella |
| DELETE | /room/:id | Poista yksittäinen huone ID:n perusteella |
|  |  |  |
| Booking | --- | --- |
| POST | /booking | Luo uusi varaus |
| GET | /booking | Hae kaikki varaukset |
| GET | /booking/:id | Hae yksittäinen varaus ID:n perusteella |
| PUT | /booking/:id | Päivitä yksittäinen varaus ID:n perusteella |
| DELETE | /booking/:id | Poista yksittäinen varaus ID:n perusteella |

### Käytetyt teknologiat
* Runtime: Node.js
* Database: SQLite & Prisma ORM
* Validation: Zod
* Testing: Jest
* Tools: Postman