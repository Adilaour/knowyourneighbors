# KnowYourNeighbors

Selbstgehostetes Kontaktbuch mit Kartenansicht: Häuser werden als Polygone auf
einer echten OpenStreetMap-Karte eingezeichnet, Kontakte werden Häusern
zugeordnet. Kein Login, gedacht für den Betrieb im eigenen LAN.

## Lokale Entwicklung

```bash
# Terminal 1: Backend (Port 3001)
cd backend
npm install
npm run dev

# Terminal 2: Frontend (Port 5173, proxied /api -> :3001)
cd frontend
npm install
npm run dev
```

Optional Beispieldaten laden: `cd backend && npm run seed`

Die App läuft dann unter http://localhost:5173.

## Erste Schritte

1. Unter **Häuser verwalten** mit dem Polygon-Werkzeug (oben links auf der
   Karte) ein Haus einzeichnen und benennen.
2. Unter **Kontakte verwalten** Kontakte anlegen und einem Haus zuordnen
   (oder direkt im Haus-Editor über "Bewohner hinzufügen"). Ein Kontakt kann
   mehrere Telefonnummern, E-Mail-Adressen und Adressen mit frei wählbarer
   Bezeichnung (Mobil, Arbeit, …) haben.
3. Auf **Karte** ein Haus anklicken, um die Bewohner zu sehen. Auf
   **Kontakte** eine Person anklicken und über "Auf Karte zeigen" das Haus
   auf der Karte hervorheben.
4. Unter **Einstellungen** das Kartenzentrum auf die Koordinaten deines
   Dorfes setzen (Platzhalter: Berlin Mitte) und bei Bedarf alle Kontakte
   als CSV exportieren.
5. Beim Anlegen/Bearbeiten eines Kontakts kann optional ein Foto (JPEG,
   PNG oder WebP, max. 5 MB) hochgeladen werden — es wird in Karte,
   Kontaktliste und Verwaltung als Avatar angezeigt.

## Adressen und Beziehungen

- **Zuhause-Adresse:** Sie wird nicht pro Person gespeichert, sondern ist die
  Adresse des Hauses, dem der Kontakt zugeordnet ist. Ändert sich die
  Hausadresse, ändert sie sich bei allen Bewohnern. Weitere Adressen (Arbeit,
  Ferienwohnung, …) trägst du am Kontakt selbst ein.
- **Beziehungen:** Beim Bearbeiten eines Kontakts unter "Beziehungen" eine
  Vorlage wählen (Familie: Mutter, Vater, Tochter, Sohn, …; Sozial / emotional:
  Freund, Gegner, Rivale, …) oder "Eigene Beziehung…" mit eigener Bezeichnung
  anlegen. Jede Beziehung hat zwei Bezeichnungen: was die andere Person für
  diesen Kontakt ist ("Mutter") und was dieser Kontakt für die andere Person ist
  ("Kind", änderbar zu "Tochter" oder "Sohn"). Die Beziehung erscheint
  automatisch bei beiden Kontakten. Bereits verwendete eigene Bezeichnungen
  werden bei weiteren Kontakten als Vorschlag angeboten.
- **Bestehende Datenbanken:** Beim ersten Start werden vorhandene Telefon- und
  E-Mail-Angaben automatisch in die neuen Listen übernommen.

## Deployment mit Docker

```bash
docker compose up -d --build
```

Die App läuft dann auf Port `3000` des Servers. Die SQLite-Datenbank liegt
persistent unter `./data/knowyourneighbors.db` (Bind-Mount).

Für den Zugriff über `knowyourneighbors.lan` muss dein bestehender Reverse
Proxy (Traefik, nginx-proxy-manager o.ä.) diesen Hostnamen auf
`<server-ip>:3000` weiterleiten. Details zur Traefik-Label-Variante stehen
als Kommentar in [docker-compose.yml](docker-compose.yml).
