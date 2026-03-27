# season_travel_map

Carte du monde interactive en 3D (façon Google Earth) affichant des recommandations de voyage selon le mois de l'année.

## Comment afficher la page

Puisque l'application charge des fichiers de données locaux (`data.json` et `world.geojson`) via des requêtes `fetch`, vous ne pouvez pas simplement ouvrir le fichier `index.html` directement dans votre navigateur à cause des restrictions de sécurité (CORS).

Vous devez démarrer un petit serveur web local.

**Si vous avez Python d'installé :**

1. Ouvrez un terminal dans le dossier du projet.
2. Exécutez la commande suivante :
   ```bash
   python3 -m http.server 8000
   ```
   *(Si `python3` ne fonctionne pas, essayez simplement `python -m http.server 8000`)*
3. Ouvrez votre navigateur et allez à l'adresse suivante : [http://localhost:8000](http://localhost:8000)

**Si vous utilisez Node.js (avec npm ou npx) :**

Vous pouvez utiliser `http-server` :
```bash
npx http-server
```
Et ouvrez le lien fourni dans le terminal.
