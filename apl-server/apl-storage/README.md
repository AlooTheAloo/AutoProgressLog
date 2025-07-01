# APL-Storage

Storage for the AutoProgressLog server.

## ❓ Purpose

This project is a part of the AutoProgressLog server.
It is responsible for storing the user's Anki database and profile picture.
It exposes an inernal API for other parts of the server to use.

## 📈 Available tables and structures in the anki user database:

The following tables are available in the user's Anki database. There are more columns in some tables, but these are the ones that are relevant for the AutoProgressLog server.

### cards

The card table consists of the cards in the user's collection. 1 card typically contains 1 note.

- id (INTEGER) | Primary Key, identifies the card
- did INTEGER | The deck ID
- usn INTEGER | The universal serial number of the synchronisation where this card was last modified
- ivl|INTEGER | The review interval of the card in days

### col

The col table is only 1 row long. It contains information about synchronisation.
The only important column field is 'usn', which is the universal serial number of the last sync.

### decks

The decks table contains information about the user's decks.

- id (INTEGER) - The deck ID
- name (TEXT) - The name of the deck

### revlog

This table contains information about the user's reviews.
**Be careful!** Revlogs are deleted after 50 days. The amount of deleted cards can be accessed with the /count endpoint.

- id (INTEGER) - The ID of the review (also the unix timestamp of the review)
- cid (INTEGER) - The ID of the card
- usn (INTEGER) - The universal serial number of the last sync
- time (INTEGER) - The time spent making the review
