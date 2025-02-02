# Share-a-Meal API
Een API om maaltijden te zoeken, maken, verwijderen. geschreven door Xin X. Wang

URL: https://share-meal-programmeren-4.herokuapp.com/

## Over de Share-a-Meal API
Als eerstejaars Avans student heb ik naar aanleiding van het vak programmeren 4 een API gebouwd in nodeJs. 

Hiermee kun je maaltijden toevoegen, verwijderen, wijzigen en zoeken.

Daarnaast kun jezelf aanmelden, registreren of gebruikers zoeken.

Ook kun je deelnemen aan maaltijden.


Om de kwaliteit van de applicatie te waarborgen, hebben we integratietesten uitgevoerd met behulp van chai/mocha en passen we CI/CD toe met github action.

## Installatie code
1. Om de code te downloaden, kun je in de github een fork doen op deze repository.
2. Download de zip-bestand uit de repository.

### Lokaal API uitvoeren
Hieronder kun je de applicatie lokaal draaien op http://localhost:3030 met deze commands.

``` 
npm start
```

//Of

```
nodemon index.js
```

## Routes API
Om gebruik te maken van de share-a-meal, zijn hieronder alle API-routes vermeld. 

Bij elke API-route, staat er vermeld wat men nodig heeft om de API te gebruiken.

De API biedt de mogelijkheid om:

1. In te loggen
2. Gebruikers te zoeken/wijzigen en verwijderen
3. Maaltijden zoeken/wijzigen of verwijderen
4. Deelname of afmelding van een maaltijd

|REQUEST|Route|
|---|---|
|POST| /api/auth/login |
|POST| /api/meal |
|GET| /api/meal |
|GET| /api/meal/{id} |
|PUT| /api/meal/{id} |
|DELETE| /api/meal/{id} |
|POST| /api/user |
|GET| /api/user |
|GET| /api/user/{id} |
|GET| /api/user/profile |
|PUT| /api/user/{id} |
|DELETE| /api/user/{id} |
|GET| /api/meal/{id}/participate|
### POST /api/auth/login, Login van gebruiker
Request:    POST

Route:      /api/auth/login

Vereisten:

Niet van toepassing

Benodigde body


```
{
    emailAdress: "emailAdress"
    password: "password"
}
```

|status code:| |
|---|---|
|200| inlog succesvol voldaan. Ontvangt gebruiker met een token.|
|400| Verkeerde input|
|404| gebruiker bestaat niet, op basis van input emailAdress.|

### Gebruikersbeheer


#### POST /api/user, Gebruiker aanmaken
Request: POST

Route: /api/user

Vereisten:

Valide email vereist

Wachtwoord minstens 8 charracters en 1 hoofdletter 1 kleine letter en 1 cijfer

Valide telefoonnummer vereist. 

Format telefoonnummer (06 of 31)(lege karakter, '-' of geen ruimte tussen 06/31 en de andere cijfers)(6 als de telefoonnummer met 31 begint)(8 cijfers)

``` 
{
    name:       "naam",
    password:   "password",
    emailAdress:"email",
    phoneNumber:"phonenumber",
    city:       "City",
    street:     "street"
}
```

|Status code| |
|---|---|
|201| succesvolle gebruiker aangemaakt|
|400| verplicht veld ontbreekt en email en wachtwoord niet valide|
|409| Gebruiker bestaat al|

#### GET /api/user, Gebruiker zoeken
Request: GET

Route: /api/user

Vereisten:

Moet ingelogd zijn


Beschikbare query parameters:

- limit => om de maximale hoeveelheid gezochte gebruikers op te vragen

- firstName => op basis van een zoekterm gebruikers opzoeken, als het voornaam op de zoekterm lijkt.

- isActive => Zoekt op gebruikers die actief of inactief zijn. Waarden: true/false


Body = niet van toepassing

|status| |
|---|---|
|200| laat alle gebruikers zien.|

#### GET /api/user/{userId}, Gebruiker op ID zoeken
Request: GET

Route: /api/user/{userId}

Vereisten:

-Geldige token

-Bestaande gebruikers

|status| |
|---|---|
|200| laat gebruiker zien|
|401| ongeldige token|
|404| GebruikerID bestaat niet|

#### GET /api/user/profile, Profiel opvragen
Request: GET
Route: /api/user/profile
Vereisten:
-Geldige token
-Moet ingelogd zijn
|status| |
|---|---|
|200| laat profiel zien.|
|401| ongeldige token.|

#### PUT /api/user/{userId}, Gebruiker wijzigen
Request: PUT

Route: /api/user/{userId}

Vereisten:

-Bestaande gebruikers

-Geldige token

-Moet ingelogd zijn

-Moet eigenaar zijn van de gebruiker


```
    {
        firstName:      "voornaam",
        lastName:       "achternaame",
        city:           "stad",
        street:         "straat",
        emailAdress:    "Email",
        password:       "Wachtwoord",
        isActive:       "isactive",
        phoneNumber:    "Telefoon"
    }
```
|status| |
|---|---|
|200| succesvolle wijziging|
|400| Niet valide input|
|401| Niet ingelogd|      

#### DELETE /api/user/{userId}, Gebruiker verwijderen
Request:    DELETE

Route:      /api/user/{userId}

Vereisten: 

-Bestaande gebruikers

-Geldige token

-Moet ingelogd zijn

-Moet eigenaar zijn van de gebruiker

|Status code| |
|---|---|
|200| succesvolle verwijdering|
|401| niet ingelogd|
|403| niet de eigenaar van de gebruiker|
|400| gebruiker bestaat niet|

### Maaltijdenbeheer

#### POST /api/meal Maaltijd aanmaken
Request:    POST

Route:      /api/meal

Vereisten: 

-token is vereist

-Moet ingelogd zijn

-Alle velden zijn verplicht

```
{
    name:                   "naam",
    description:            "Beschrijving",
    isActive:               "boolean",
    isVega:                 "boolean",
    isVegan:                "boolean",
    isToTakeHome:           "boolean",
    dateTime:               "Jaar-maand-dagTuur:minuten:seconden",
    imageUrl:               "https://afbeelding.jpg",
    allergenes:              allergenenArray(Array uit noten, gluten en of lactose),
    maxAmountOfParticipants: nummer,
    price:                   prijs(float waarde)
}
```

|Status code| |
|---|---|
|201| maaltijd succesvol aangemaakt|
|401| niet ingelogd|
|400| inputwaarden ongeldig/ontbreken|

#### PUT /api/meal/{mealId}, Maaltijd wijzigen
Request:    PUT

Route:      /api/meal/{mealId}

Vereisten: 

-Token is vereist

-Moet ingelogd zijn

-Alle velden zijn verplicht

-Moet eigenaar zijn van de maaltijd

-Maaltijd moet bestaan


```
{
    name:                   "naam",
    description:            "Beschrijving",
    isActive:               "boolean",
    isVega:                 "boolean",
    isVegan:                "boolean",
    isToTakeHome:           "boolean",
    dateTime:               "Jaar-maand-dagTuur:minuten:seconden",
    imageUrl:               "https://afbeelding.jpg",
    allergenes:              allergenen,
    maxAmountOfParticipants: nummer,
    price:                   prijs
}
```
|Status code| |
|---|---|
|201| maaltijd succesvol gewijzigd|
|400| inputwaarden ongeldig/ontbreken|
|401| niet ingelogd|
|403| niet de eigenaar van de maaltijd|
|404| Maaltijd bestaat niet|

#### GET /api/meal, Maaltijd ophalen
Request:    GET

Route:      /api/meal

Vereisten: 

niet van toepassing


|Status code| |
|---|---|
|200| Geeft lijst met maaltijden terug|

#### GET /api/meal/{mealId}, Maaltijd details opvragen

Request:    GET

Route:      /api/meal/{mealId}

Vereisten: 

niet van toepassing


Status code
200 Maaltijd met details terug

#### DELETE /api/meal/{mealId}, Maaltijd verwijderen

Request:    DELETE

Route:      /api/meal/{mealId}

Vereisten: 

-Token is vereist

-Moet eigenaar zijn van de maaltijd

-Maaltijd moet bestaan

|Status code| |
|---|---|
|200| maaltijd succesvol verwijdert|
|401| niet ingelogd|
|403| niet de eigenaar van de maaltijd|
|404| maaltijd bestaat niet|

### Participatie van maaltijden.

#### GET /api/meal/{mealId}/participate, Aanmelding/Afmelding maaltijd

Request:    GET

Route:      /api/meal/{mealId}/participate
Vereisten: 

-Token is vereist

-Moet eigenaar zijn van de maaltijd

-Maaltijd moet bestaan

|Status code| |
|---|---|
|200|succesvolle aanmelding/succesvolle afmelding|
|401|niet ingelogd|
|404|maaltijd bestaat niet|

## Technische specificaties

### Programmeertalen

Hieronder staan alle technische specificaties beschreven die in de applicatie zijn toegepast.

|Programmeertalen:| Doeleinden|Versie|
|---|---|---|
|NodeJs|Server en API|17.9.0|
|MariaDB|Relationele database|10.4.24|

### Andere applicaties
Hieronder staan alle applicaties die zijn gebruikt die de applicatie ondersteunen.

|Applicatie|Doeleinden|
|---|---|
|Heroku|Hosten van de server|
|Github Action|Continues Integration/Development(CD/CI)|
|Github|Cloud repository en versiebeheer|

## Contact

Voor contact met de ontwikkelaar, kunt u een mail sturen naar het volgende emailadres.

Email: xx.wang@student.avans.nl


