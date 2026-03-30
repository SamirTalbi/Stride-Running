import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const posts: Record<string, {
  title: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  publishedAt: string;
  content: string;
}> = {
  "choisir-premieres-chaussures-running": {
    title: "Comment choisir ses premières chaussures de running : le guide complet",
    excerpt: "Acheter sa première paire de chaussures de running peut être intimidant. Voici tout ce qu'il faut savoir pour faire le bon choix.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop",
    author: "Sarah Mitchell",
    category: "Guide Débutant",
    readTime: "8 min",
    publishedAt: "8 mars 2024",
    content: `
## Pourquoi le bon choix de chaussures est crucial

La chaussure de running est l'équipement le plus important pour un coureur. Une mauvaise paire peut provoquer des blessures, des douleurs aux genoux, aux hanches ou au dos. À l'inverse, la bonne chaussure vous permettra de courir plus longtemps, plus confortablement et en toute sécurité.

## Comprendre votre foulée

Avant tout achat, il est essentiel de comprendre votre type de foulée :

**La pronation neutre** — Votre pied atterrit sur le côté externe du talon, puis roule vers l'intérieur de façon équilibrée. La majorité des coureurs ont une foulée neutre. Vous pouvez choisir une large gamme de chaussures.

**La sur-pronation** — Votre pied roule excessivement vers l'intérieur à chaque foulée. Cela peut causer des douleurs aux genoux et aux chevilles. Optez pour des chaussures avec contrôle du mouvement ou stabilité.

**La sous-pronation (supination)** — Votre pied ne roule pas assez vers l'intérieur. Vous avez besoin de chaussures avec un bon amorti et de la flexibilité.

💡 **Astuce** : mouiller la plante de vos pieds et marchez sur une surface sombre. La forme de votre empreinte vous indique votre type de voûte plantaire.

## Les critères à prendre en compte

### 1. L'amorti
L'amorti absorbe l'impact à chaque foulée. Plus vous courez sur du bitume et sur de longues distances, plus vous aurez besoin d'amorti. Si vous débutez, un amorti moyen à élevé est recommandé pour protéger vos articulations.

### 2. La drop
La drop (ou dénivellation) est la différence de hauteur entre le talon et l'avant du pied. Une drop élevée (8-12mm) convient aux coureurs qui attaquent avec le talon. Une drop faible (0-4mm) favorise une foulée médio-pied, plus naturelle mais qui demande une adaptation progressive.

### 3. La largeur
Ne négligez pas la largeur de votre chaussure. Vos orteils doivent avoir de l'espace pour se déployer. Un espace d'environ un centimètre entre votre orteil le plus long et le bout de la chaussure est idéal.

### 4. La surface de course
- **Route** : chaussures légères avec amorti adapté au bitume
- **Trail** : semelles crantées pour l'accroche sur les terrains naturels
- **Piste** : chaussures ultra-légères avec pointes

## Nos recommandations pour débuter

Pour un premier achat, nous recommandons de vous orienter vers des chaussures avec :
- Un amorti moyen à élevé
- Une drop entre 6 et 10mm
- Un maintien neutre ou légèrement stabilisant

Les modèles comme le **Brooks Ghost**, l'**ASICS Gel-Nimbus** ou le **New Balance Fresh Foam 1080** sont d'excellentes options pour les débutants.

## Où acheter et comment essayer

Idéalement, rendez-vous dans un magasin spécialisé en fin de journée (vos pieds sont légèrement plus grands le soir). Essayez les chaussures avec vos chaussettes de running habituelles. Courez quelques pas dans le magasin pour sentir la chaussure en mouvement.

**Évitez d'acheter uniquement sur le critère esthétique.** La performance et le confort doivent primer. Votre dos, vos genoux et vos chevilles vous remercieront.
    `,
  },

  "running-route-vs-trail": {
    title: "Running route vs trail : quelle chaussure choisir ?",
    excerpt: "Toutes les chaussures de running ne se valent pas. Comprendre les différences clés vous aidera à performer et éviter les blessures.",
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=1200&h=600&fit=crop",
    author: "Mike Torres",
    category: "Tests & Comparatifs",
    readTime: "6 min",
    publishedAt: "5 mars 2024",
    content: `
## La grande différence : la surface

La distinction fondamentale entre une chaussure de route et une chaussure de trail réside dans la surface sur laquelle vous courez. Ce n'est pas qu'une question de style — c'est une question de sécurité et de performance.

## La chaussure de route

La chaussure de route est conçue pour les surfaces dures et régulières : bitume, trottoirs, pistes cyclables. Elle se caractérise par :

**Une semelle lisse** — La semelle est plate ou très légèrement texturée. Elle est optimisée pour maximiser le retour d'énergie sur sol dur.

**Un amorti généreux** — Le bitume est une surface très dure qui transmet les chocs. Les chaussures de route absorbent ces impacts pour protéger vos articulations sur la durée.

**Un poids réduit** — Les chaussures de route sont généralement plus légères, ce qui favorise la vitesse et l'efficacité.

**La flexibilité** — La semelle se plie facilement pour accompagner le mouvement naturel du pied.

## La chaussure de trail

Le trail, c'est courir sur des sentiers, des chemins de terre, des rochers, des racines. La chaussure de trail est faite pour ça :

**Des crampons prononcés** — Les semelles crantées offrent une adhérence sur les surfaces glissantes, boueuses ou rocheuses. Plus le terrain est exigeant, plus les crampons doivent être profonds.

**Une protection renforcée** — Pare-pierres en caoutchouc sous la semelle, renfort au niveau de l'orteil, tissu résistant. Le trail, c'est souvent cailloux, racines et obstacles en tout genre.

**Un maintien du pied accru** — Les chaussures de trail enveloppent mieux le pied pour éviter les entorses sur terrain irrégulier.

**Une imperméabilité optionnelle** — Certains modèles sont équipés d'une membrane Gore-Tex pour les sorties sous la pluie ou dans les ruisseaux.

## Peut-on utiliser des chaussures de trail sur la route ?

Techniquement oui, mais ce n'est pas idéal. Les crampons s'usent rapidement sur le bitume et la semelle plus rigide rend la course moins agréable. Pour les courses mixtes (route + chemin), des chaussures polyvalentes existent.

## Notre verdict

Si vous courez **principalement en ville** → chaussures de route.
Si vous courez **en nature, sur des sentiers** → chaussures de trail.
Si vous **mélangez les deux** → regardez les modèles hybrides comme le **Salomon Sonic** ou le **Hoka Speedgoat** version route.

L'essentiel : ne courrez pas un trail technique avec des chaussures de route, ni un semi-marathon sur bitume avec des chaussures de trail lourdes et crantées.
    `,
  },

  "preparer-premier-marathon": {
    title: "Préparer son premier marathon : plan semaine par semaine",
    excerpt: "Un plan d'entraînement complet sur 16 semaines pour vous amener sereinement jusqu'à la ligne d'arrivée de votre premier marathon.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=600&fit=crop",
    author: "Emma Richards",
    category: "Entraînement",
    readTime: "12 min",
    publishedAt: "28 février 2024",
    content: `
## Avant de commencer : êtes-vous prêt ?

Courir un marathon (42,195 km) est l'un des défis physiques les plus exigeants qui soit. Pour vous lancer dans une préparation de 16 semaines, vous devriez idéalement déjà être capable de courir 30 à 45 minutes sans vous arrêter, 3 fois par semaine.

## Les principes fondamentaux

**La progressivité** — N'augmentez jamais votre kilométrage hebdomadaire de plus de 10% d'une semaine à l'autre. C'est la règle des 10% et elle existe pour éviter les blessures.

**La récupération** — Au moins un jour de repos complet par semaine. Vos muscles se reconstruisent pendant le repos, pas pendant l'effort.

**La sortie longue** — Chaque semaine, une sortie longue à allure lente (conversation possible). C'est le pilier de la préparation marathon.

**L'allure marathon** — Apprenez à courir à votre allure cible. Elle doit être une allure à laquelle vous pouvez tenir une conversation sans être essoufflé.

## Le plan semaine par semaine (résumé)

### Phase 1 : Construction de la base (semaines 1-4)
- **Semaine 1** : 4 sorties — 30 min / 45 min / 30 min / 1h (sortie longue)
- **Semaine 2** : 4 sorties — 35 min / 45 min / 35 min / 1h15
- **Semaine 3** : 4 sorties — 40 min / 50 min / 40 min / 1h30
- **Semaine 4** (récupération) : réduction de 30% du volume

### Phase 2 : Développement (semaines 5-8)
- Introduction des sorties à allure marathon
- Sortie longue jusqu'à 2h
- Ajout d'une séance de fractionné court (10x400m)

### Phase 3 : Intensification (semaines 9-12)
- Sorties longues jusqu'à 32-35 km
- Séances spécifiques marathon (2x8km à allure cible)
- Volume hebdomadaire au maximum

### Phase 4 : Affûtage (semaines 13-16)
- **Semaine 13** : réduction de 20% du volume
- **Semaine 14** : réduction de 40%
- **Semaine 15** : jogging léger, jambes fraîches
- **Semaine 16** : Race week — repos, hydratation, confiance

## La nutrition pendant la préparation

Augmentez vos apports en glucides complexes (pâtes, riz, patates douces) au fur et à mesure que votre kilométrage augmente. Pendant les longues sorties dépassant 1h30, habituez-vous à vous ravitailler avec des gels énergétiques ou des dattes.

## Le jour J

- Partez plus lentement que prévu les 10 premiers kilomètres
- Ne changez rien à votre routine (ni nouvelle chaussure, ni nouveau gel)
- Profitez de chaque kilomètre — vous faites quelque chose d'extraordinaire
    `,
  },

  "meilleures-chaussures-hoka-2024": {
    title: "Les meilleures chaussures HOKA en 2024 — Notre classement",
    excerpt: "On a testé tous les modèles HOKA pour vous. Voici nos coups de cœur pour la route, le trail et la récupération.",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&h=600&fit=crop",
    author: "James Park",
    category: "Tests & Comparatifs",
    readTime: "10 min",
    publishedAt: "20 février 2024",
    content: `
## Pourquoi HOKA s'est imposé

Il y a dix ans, HOKA était une marque confidentielle de trail ultra. Aujourd'hui, c'est l'une des marques de running les plus portées au monde, reconnue pour ses semelles épaisses, son amorti maximaliste et ses performances sur longues distances. Voici notre sélection des meilleurs modèles.

## 🥇 HOKA Clifton 9 — Le meilleur polyvalent

**Pour qui** : tous les coureurs, toutes distances.

Le Clifton est le modèle phare de HOKA depuis des années, et le Clifton 9 n'échappe pas à la règle. Léger (environ 246g), amorti généreux, excellente respirabilité. C'est la chaussure que l'on met le matin sans se poser de questions.

- Amorti : ★★★★☆
- Légèreté : ★★★★☆
- Durabilité : ★★★★★
- **Prix indicatif** : 150€

## 🥈 HOKA Bondi 8 — Le roi de l'amorti

**Pour qui** : coureurs cherchant le maximum de confort, longues distances.

Le Bondi, c'est la Rolls-Royce de l'amorti. Semelle ultra-épaisse, mousse EVA généreuse, sensation de courir sur des nuages. Un peu plus lourd que le Clifton, mais imbattable en confort sur marathon et au-delà.

- Amorti : ★★★★★
- Légèreté : ★★★☆☆
- Durabilité : ★★★★★
- **Prix indicatif** : 170€

## 🥉 HOKA Speedgoat 5 — Le trail incontournable

**Pour qui** : coureurs de trail, ultras en montagne.

Le Speedgoat est la référence trail de HOKA. Crampons Vibram ultra-adhérents, protection maximale des pieds, maintien exceptionnel. Si vous faites du trail sérieux, le Speedgoat est difficile à battre.

- Accroche : ★★★★★
- Protection : ★★★★★
- Polyvalence route : ★★☆☆☆
- **Prix indicatif** : 175€

## ⚡ HOKA Rocket X 2 — La chaussure de course

**Pour qui** : coureurs rapides, compétition.

La plaque carbone du Rocket X 2 propulse chaque foulée. Ultra-légère, réactive, elle est conçue pour les PR et les podiums. Pas pour l'entraînement quotidien.

- Réactivité : ★★★★★
- Confort quotidien : ★★☆☆☆
- **Prix indicatif** : 225€

## Notre conseil final

Si vous ne devez acheter qu'une seule paire HOKA, choisissez le **Clifton 9**. Il offre le meilleur équilibre confort/performance/durabilité pour la grande majorité des coureurs.
    `,
  },

  "nutrition-running-guide": {
    title: "Nutrition running : quoi manger avant, pendant et après",
    excerpt: "Optimisez votre alimentation avec notre guide complet sur la nutrition, l'hydratation et les aliments de récupération pour les coureurs.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
    author: "Dr. Lisa Chen",
    category: "Nutrition",
    readTime: "9 min",
    publishedAt: "15 février 2024",
    content: `
## L'alimentation, carburant du coureur

Ce que vous mangez avant, pendant et après vos sorties a un impact direct sur vos performances et votre récupération. Voici le guide complet pour optimiser votre nutrition de coureur.

## Avant la course

### 2-3 heures avant : le repas principal
Privilégiez les glucides complexes à faible index glycémique :
- Flocons d'avoine avec des fruits
- Pâtes ou riz complet avec une petite portion de protéines
- Pain complet avec du beurre de cacahuète

Évitez les aliments gras, frits ou trop fibreux qui peuvent causer des problèmes digestifs pendant l'effort.

### 30-60 minutes avant : le boost
Une petite collation légère si nécessaire :
- Une banane
- Une barre énergétique
- Quelques dattes

### L'hydratation pré-course
Buvez 400-600ml d'eau dans les 2 heures précédant votre sortie. Ne buvez pas trop juste avant pour éviter la gêne abdominale.

## Pendant la course

### Sorties inférieures à 1 heure
Pas besoin de ravitaillement si vous êtes bien hydraté. De l'eau suffit.

### Sorties de 1h à 2h
- **Glucides** : 30-60g par heure (gels, dattes, bananes, barres)
- **Hydratation** : 400-800ml d'eau par heure selon la chaleur

### Sorties de plus de 2h
- **Glucides** : jusqu'à 90g par heure si vous combinez glucose + fructose
- **Électrolytes** : sodium, potassium pour éviter les crampes
- **Habituez-vous** en entraînement aux produits que vous utiliserez en course

## Après la course

La fenêtre de récupération des 30 premières minutes est cruciale.

### La règle des 3R
**Recharger** — Glucides pour reconstituer les réserves de glycogène (riz, pâtes, pain)
**Reconstruire** — Protéines pour réparer les fibres musculaires (20-25g)
**Réhydrater** — 150% du poids perdu en liquide

### Le repas idéal post-course
- Riz + poulet + légumes
- Smoothie banane + lait + protéine
- Omelette + pain complet + avocat

## Les erreurs nutritionnelles à éviter

❌ Courir à jeun sur de longues distances
❌ Négliger l'hydratation par temps froid (on transpire moins visiblement mais on se déshydrate autant)
❌ Tester un nouveau gel ou aliment le jour de la course
❌ Manger trop juste avant de courir
    `,
  },

  "passer-sous-4h-marathon": {
    title: "Comment passer sous les 4h au marathon",
    excerpt: "Conseils d'experts, stratégies d'entraînement et chaussures recommandées pour atteindre l'objectif des 4 heures au marathon.",
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=1200&h=600&fit=crop",
    author: "Coach David Kim",
    category: "Entraînement",
    readTime: "7 min",
    publishedAt: "10 février 2024",
    content: `
## Le mythe des 4 heures

Passer sous les 4 heures au marathon — soit une allure de 5'41"/km — est un objectif symbolique pour des millions de coureurs. Ce n'est pas réservé aux élites. Avec la bonne préparation, c'est tout à fait accessible.

## Votre allure cible

Pour finir en 3h59, vous devez maintenir **5'41" par kilomètre** en moyenne. En pratique, visez **5'35"** pour avoir une marge de sécurité sur les kilomètres difficiles (28-35km, le fameux mur du marathon).

## Les séances clés

### 1. La sortie longue progressive
Une fois par semaine, sortie longue en augmentant progressivement jusqu'à 35km à 6'00"-6'15"/km. Ces sorties construisent votre endurance fondamentale et habituent votre corps aux longues distances.

### 2. Les sorties à allure marathon
2 fois par semaine, des blocs à votre allure cible (5'35"-5'45") : commencez par 2x4km, progressez jusqu'à 2x10km. C'est la séance la plus spécifique de votre préparation.

### 3. Le fractionné court
Une séance hebdomadaire de fractionné (10x400m à 4'50"-5'00"/km) pour développer votre VMA et rendre votre allure marathon plus confortable.

## La stratégie de course

**Premier semi-marathon** : courez à 5'45"/km. Vous arriverez à mi-parcours en 2h01-2h02. Ce léger surplus de temps vous permet d'avoir de l'énergie pour la deuxième moitié.

**Entre 21 et 30 km** : maintenez 5'40"-5'45". Restez régulier, ne vous laissez pas entraîner par l'euphorie.

**Les 10 derniers kilomètres** : si vous avez géré intelligemment les premiers 32km, vous aurez encore de l'énergie pour finir fort. Accélérez progressivement à partir du km 35.

## Les chaussures qui font la différence

Pour passer sous les 4h, les chaussures à plaque carbone peuvent faire gagner 2 à 4 minutes sur un marathon. Le **Nike Vaporfly**, l'**Adidas Adizero Adios Pro** ou le **HOKA Rocket X** sont des options à considérer. Si le budget est limité, des chaussures à retour d'énergie sans plaque comme le **Brooks Hyperion Max** restent excellentes.

## Les 3 erreurs qui font rater les 4h

1. **Partir trop vite** — Le mur du marathon frappe ceux qui partent à 5'30" sur le premier semi
2. **Négliger la nutrition** — Prenez un gel toutes les 40 minutes dès le départ
3. **Manquer de volume à l'entraînement** — Vous devez courir au minimum 55-65 km par semaine au pic de préparation
    `,
  },

  "erreurs-debutant-running": {
    title: "5 erreurs à éviter quand on débute le running",
    excerpt: "Trop en faire trop vite, négliger l'échauffement, ignorer les douleurs… Découvrez les pièges classiques du débutant et comment les éviter.",
    image: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=1200&h=600&fit=crop",
    author: "Sarah Mitchell",
    category: "Guide Débutant",
    readTime: "5 min",
    publishedAt: "5 février 2024",
    content: `
## Le running est plus technique qu'il n'y paraît

On enffile des chaussures, on sort et on court. Simple, non ? En théorie. En pratique, la grande majorité des blessures de running sont évitables et surviennent suite aux mêmes erreurs de débutant. Voici lesquelles — et comment les contourner.

## ❌ Erreur 1 : Trop vite, trop tôt

C'est l'erreur numéro 1. Motivé par votre nouvel objectif, vous sortez courir tous les jours dès la première semaine. Résultat : périostite, tendinite ou fracture de fatigue.

**La règle** : ne dépassez jamais +10% de kilométrage par rapport à la semaine précédente. Intégrez des jours de repos. Le corps a besoin de temps pour s'adapter aux contraintes du running.

## ❌ Erreur 2 : Négliger l'échauffement

Partir directement en course depuis votre canapé, c'est comme démarrer une voiture à froid et pousser le moteur. Vos muscles, tendons et articulations ont besoin de se préparer.

**La solution** : 5-10 minutes de marche rapide + quelques exercices de mobilité avant chaque sortie. À l'arrivée, 5 minutes d'étirements.

## ❌ Erreur 3 : Courir trop vite

La plupart des débutants courent trop vite. La grande majorité de vos entraînements devrait se faire à une allure où vous pouvez tenir une conversation. Si vous êtes essoufflé au point de ne plus parler, ralentissez.

**Le test** : si vous ne pouvez pas prononcer une phrase complète pendant votre course, vous allez trop vite pour un entraînement d'endurance de base.

## ❌ Erreur 4 : Ignorer les douleurs

"Ça va passer" — cette phrase a mis fin à plus d'une saison de running. Il faut distinguer l'inconfort (normal lors d'un effort) de la douleur (signal d'alarme).

**La règle des 2 semaines** : si une douleur persiste plus de 2 semaines, consultez un médecin du sport ou un kiné. Une blessure traitée tôt guérit vite. Une blessure ignorée peut vous immobiliser des mois.

## ❌ Erreur 5 : Les mauvaises chaussures

Courir dans des chaussures inadaptées (vieilles baskets de sport, chaussures trop petites, drop inadaptée à votre foulée) multiplie les risques de blessures.

**La solution** : investissez dans une paire de running adaptée à votre foulée et à votre surface de course. Ce n'est pas un luxe, c'est une nécessité. Renouvelez vos chaussures tous les 700-900km environ.
    `,
  },

  "running-hiver-conseils": {
    title: "Running en hiver : nos conseils pour courir par temps froid",
    excerpt: "Le froid ne doit pas être une excuse pour rester chez soi. Voici comment s'habiller, s'échauffer et rester motivé tout l'hiver.",
    image: "https://images.unsplash.com/photo-1508215885820-4585e56135c8?w=1200&h=600&fit=crop",
    author: "Emma Richards",
    category: "Conseils Pratiques",
    readTime: "6 min",
    publishedAt: "28 janvier 2024",
    content: `
## Courir en hiver : bonne ou mauvaise idée ?

Excellente idée. Les coureurs qui maintiennent leur entraînement en hiver arrivent au printemps avec une base solide, pendant que les autres reprennent de zéro. Le froid n'est pas un obstacle — c'est une question d'adaptation.

## La règle de base : habillez-vous pour 10°C de plus

Quand vous courez, votre corps génère de la chaleur. Habillez-vous comme s'il faisait 10°C de plus que la température réelle. Si il fait 5°C, habillez-vous pour 15°C. Au départ vous aurez froid, mais c'est normal — après 10 minutes de course vous serez à la bonne température.

## La stratégie des couches

### Première couche (la plus importante)
Un sous-vêtement technique qui évacue la transpiration. Jamais de coton — le coton garde l'humidité et vous refroidit. Optez pour de la laine mérinos ou un tissu synthétique respirant.

### Deuxième couche
Un mid-layer léger pour l'isolation thermique. Une veste fine ou un long sleeve respirant.

### Troisième couche (si < 0°C)
Un coupe-vent léger et imperméable pour vous protéger du vent et de la pluie.

## Les extrémités, priorité absolue

Vos mains et vos oreilles perdent énormément de chaleur. Investissez dans :
- **Des gants de running** : ils changeront votre vie sous 10°C
- **Un bandeau ou bonnet** : les oreilles refroidies créent des maux de tête
- **Des chaussettes thermiques** : gardez les pieds au chaud et au sec

## L'échauffement en hiver

Par temps froid, rallongez votre échauffement de 5 minutes. Commencez en marchant puis trottinant. Vos muscles sont plus froids et plus rigides — les forcer à démarrer trop vite augmente le risque de déchirure.

## Rester motivé quand il fait noir et froid

**La lumière** : investissez dans un gilet réfléchissant et une lampe frontale. Courir dans le noir devient vite agréable avec le bon équipement.

**La communauté** : rejoignez un club de running local. Courir en groupe en hiver est infiniment plus motivant que courir seul.

**Les objectifs** : inscrivez-vous à une course au printemps. Avoir un objectif concret transforme les sorties hivernales en investissement, pas en corvée.

## Les températures limites

En dessous de **-15°C**, le risque de lésions pulmonaires augmente. Protégez votre bouche avec un tour de cou ou un buff. En dessous de **-20°C**, privilégiez le tapis de course ou le repos.

Sur verglas ou neige tassée, des chaussures de trail ou des crampons de running (Yaktrax) évitent les chutes.
    `,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { elements.push(<br key={key++} />); continue; }

    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={key++} className="font-display font-black text-2xl text-gray-900 mt-10 mb-4">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={key++} className="font-bold text-lg text-gray-900 mt-6 mb-2">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.split("**").length === 3) {
      // Entire line bold
      elements.push(<p key={key++} className="font-semibold text-gray-900 mt-3">{trimmed.slice(2, -2)}</p>);
    } else if (trimmed.startsWith("- ")) {
      elements.push(<li key={key++} className="text-gray-600 leading-relaxed ml-4 list-disc">{trimmed.slice(2)}</li>);
    } else if (trimmed.startsWith("❌") || trimmed.startsWith("✅") || trimmed.startsWith("💡") || trimmed.startsWith("⚡")) {
      elements.push(<p key={key++} className="text-gray-700 leading-relaxed my-2">{trimmed}</p>);
    } else {
      // Parse inline bold
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(<p key={key++} className="text-gray-600 leading-relaxed my-2">{rendered}</p>);
    }
  }

  return elements;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) notFound();

  const otherPosts = Object.entries(posts)
    .filter(([s]) => s !== slug)
    .slice(0, 3);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors mb-8">
          <ArrowLeft size={16} /> Retour aux articles
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="default" className="mb-4">{post.category}</Badge>
          <h1 className="font-display font-black text-4xl lg:text-5xl text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-b border-gray-100 py-4">
            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.publishedAt}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime} de lecture</span>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-card">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        </div>

        {/* Content */}
        <div className="prose-custom">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-brand-50 border border-brand-200 rounded-2xl text-center">
          <p className="font-bold text-gray-900 mb-1">Prêt à passer à l&apos;action ?</p>
          <p className="text-sm text-gray-500 mb-4">Découvrez notre sélection de chaussures et équipements running.</p>
          <Link
            href="/shoes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            Voir les chaussures
          </Link>
        </div>
      </div>

      {/* Other articles */}
      {otherPosts.length > 0 && (
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-display font-black text-2xl text-gray-900 mb-6">D&apos;autres articles</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {otherPosts.map(([s, p]) => (
              <Link key={s} href={`/blog/${s}`} className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                <div className="relative h-36 overflow-hidden">
                  <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <Badge variant="default" className="mb-2 text-[10px]">{p.category}</Badge>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-brand-500 transition-colors line-clamp-2">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> {p.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
