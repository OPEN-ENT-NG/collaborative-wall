# À propos de l'application Mur collaboratif

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright Région Hauts-de-France (ex Picardie)
* Développeur(s) : 
    * ATOS
    * CGI 
	* Open Digital Education
* Financeur(s) : 
    * Région Hauts-de-France (ex Picardie)
    * Mairie de Paris


* Description : Application d'édition et de  partage de murs collaboratifs. Un mur collaboratif est un espace permettant à plusieurs utilisateurs d'y disposer des notes textuelles ou multimédias sous une forme graphique et ergonomique.

# Documentation technique

## Build
<pre>
        gulp build
        gradle install
</pre>

## Construction

<pre>
		gradle copyMod
</pre>

## Déployer dans ent-core


## Configuration

Dans le fichier `/collaborative-wall/deployment/collaborativewall/conf.json.template` :


Déclarer l'application dans la liste :
<pre>
{
      "name": "net.atos~collaborativewall~0.11.0",
      "config": {
        "main" : "net.atos.entng.collaborativewall.CollaborativeWall",
        "port" : 8071,
        "app-name" : "CollaborativeWall",
        "app-address" : "/collaborativewall",
        "app-icon" : "collaborative-wall-large",
        "host": "${host}",
        "ssl" : $ssl,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "app-registry.port" : 8012,
        "mode" : "${mode}",
        "entcore.port" : 8009
     }
}
</pre>

Associer une route d'entrée à la configuration du module proxy intégré (`"name": "net.atos~collaborativewall~0.11.0"`) :
<pre>
	{
		"location": "/collaborativewall",
		"proxy_pass": "http://localhost:8071"
	}
</pre>

# Présentation du module

## Fonctionnalités

Le Mur Collaboratif permet de créer un mur sur lequel les contributeurs peuvent chacun ajouter des notes, à la façon d’un tableau sur lequel on ajoute des post-it.

Des permissions sur les différentes actions possibles sur les murs collaboratifs, dont la contribution et la gestion, sont configurées dans les murs collaboratifs (via des partages Ent-core).
Le droit de lecture, correspondant à qui peut consulter le mur collaboratif est également configuré de cette manière.

Le Mur Collaboratif met en œuvre un comportement de recherche sur le nom et la description des murs.

## Modèle de persistance

Les données du module sont stockées dans deux collections Mongo "collaborativewall" et "collaborativewall.notes".

## Modèle serveur

Le module serveur utilise un contrôleur de déclaration :

* `CollaborativeWallController` : Point d'entrée à l'application, Routage des vues, sécurité globale et déclaration de l'ensemble des comportements relatifs aux murs collaboratifs (liste, création, modification, destruction, édition et partage)

Le contrôleur étend les classes du framework Ent-core exploitant les CrudServices de base.

Le module serveur met en œuvre deux évènements issus du framework Ent-core :

* `CollaborativeWallRepositoryEvents` : Logique de changement d'année scolaire
* `CollaborativeWallSearchingEvents` : Logique de recherche

Deux jsonschema permettent de vérifier les données reçues par le serveur, ils se trouvent dans le dossier "src/main/resources/jsonschema".

## Modèle front-end

Le modèle Front-end manipule un objet model :

* `Walls` : Correspondant aux murs collaboratifs

Il y a une collection globale :

* `model.walls.all` qui contient l'ensemble des objets `wall` synchronisés depuis le serveur.
