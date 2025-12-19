# MasterMind – README

## 1. Présentation du projet
MasterMind est une application web pour aider les étudiants de Licence qui veulent continuer en Master. Le but est de rendre la recherche de formations simple et agréable.

Le projet répond à un vrai besoin : souvent les sites de Masters sont compliqués ou ennuyeux, et les étudiants peuvent se sentir perdus. MasterMind veut rendre cette expérience plus ludique et motivante.
---

## 2. Présentation technique
- L’application fonctionne directement dans un navigateur (Chrome, Firefox, Edge…)
- Tout le contenu du site est organisé pour que ce soit facile à lire et à utiliser
- On utilise des graphiques pour montrer par exemple le taux d’admission ou les débouchés
- Il y a une carte pour localiser les établissements

### Ce qu’on évite
- Trop d’informations qui rendent le site compliqué
- Publicités ou fenêtres pop-up qui dérangent

### Fonctionnalités Clés
Exploration par Discipline : Une grille visuelle (avec des mascottes dédiées) pour choisir son grand domaine (Droit, Sciences, Arts...).
Sélection du Master : Une liste épurée des mentions disponibles pour le secteur choisi, avec identification immédiate des formations en alternance.

Le "Dashboard" de Formation : Une fiche détaillée pour chaque Master comprenant :
    Sélectivité en un clin d'œil : Une jauge indiquant le taux d'admission.
    Débouchés réels : Graphiques sur les types d'emplois (Cadre, Stable, Temps plein).
    Transparence financière : Comparatif visuel des salaires Bruts vs Nets.
    Profil des admis : Répartition Boursiers/Non-boursiers et origine des diplômes précédents (Licence Pro, Générale...).
    Localisation : Carte interactive pour situer l'établissement.

### Le design
- Couleurs : rose, jaune, bleu
  - Jaune = optimisme et motivation  
  - Rose = créativité et bienveillance  
  - Bleu = confiance et stabilité  
  - Bleu foncé = lisibilité sur certains poitns clés

- Une mascotte (logo) pour rendre le site plus chaleureux et rassurant en forme de M
- Nom du site : MasterMind
—

### Architecture Technique

MasterMind est une App en single page, construite avec des technologies web standards, sans framework lourd, pour garantir rapidité et compatibilité.

Le technique :

    Frontend : HTML5 sémantique, CSS3, JavaScript.
    Visualisation de données  ECharts pour le rendu des graphiques interactifs et animés.
    Cartographie : Leaflet.js couplé à OpenStreetMap.
    Géocodage : API Nominatim pour convertir les adresses des universités en coordonnées GPS.

Les Données (API & Backend) :

L'application ne possède pas de base de données propre, elle utilise plsueiurs API :

    Données statistiques : Récupérées via l'API de l'IUT (/api/rest).
    Logos Établissements : Récupérés dynamiquement via l'API publique de monmaster.gouv.fr grâce au code UAI.
    Gestion du Cache : Un système de cache local (localStorage) est implémenté (cacheManagement.js) pour stocker les statistiques pendant 1 heure afin de limiter les requêtes réseau et accélérer la navigation.


### Organisation des fichiers

CREA-1-SAE-301-303/
│
├── index.html          # Page de détail d'un Master (Dashboard)
├── discipline.html     # Page d'accueil (Choix du domaine)
├── discipline2.html    # Page de liste (Choix de la mention)
│
├── css/
│   └── style.css       # Feuille de style unique (Design System)
│
├── js/                 # Logique applicative (Modules ES6)
│   ├── orchestrator.js    # Chef d'orchestre de la page détail (charge tout)
│   ├── RESTManagement.js  # Gestion centrale des appels API (Fetch)
│   ├── cacheManagement.js # Gestion du LocalStorage
│   ├── discipline.js      # Logique page d'accueil (Grid & Mascottes)
│   ├── discipline2.js     # Logique page liste (Tri & Filtrage)
│   │
│   └── [Composants Graphiques]
│       ├── grapheAdmission.js
│       ├── grapheEmploi.js
│       ├── grapheInsertion.js
│       ├── grapheOrigine.js
│       └── grapheSalaire.js
│
└── images/             # Mascottes SVG, logos et icônes


### TODO
 Faire en srote que le bouton qui renvoie sur le site de l'établissement fonctionne (nécessite de trouver une API avec les sites ?)
 Changer le graphe sur les Types d'emplois -> Incoherence car les contrats de cadre peuvent inclure les emplois stables et a temps plein 