# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link "FoodDelivery" [ref=e6] [cursor=pointer]:
        - /url: /
        - heading "FoodDelivery" [level=2] [ref=e8]
      - region "Changer de langue" [ref=e10]:
        - button "Passer à English" [ref=e11] [cursor=pointer]:
          - generic [ref=e14]: Français
        - generic [ref=e15]: "Langue actuelle : Français: Français"
      - list [ref=e16]:
        - listitem [ref=e17]:
          - link "Connexion" [ref=e18] [cursor=pointer]:
            - /url: /login
        - listitem [ref=e19]:
          - link "Inscription" [ref=e20] [cursor=pointer]:
            - /url: /register
  - main [ref=e21]:
    - generic [ref=e22]:
      - heading "Une erreur est survenue" [level=1] [ref=e23]
      - paragraph [ref=e24]: Restaurant avec l'ID 1 introuvable
      - link "← Retour à la liste des restaurants" [ref=e25] [cursor=pointer]:
        - /url: /utilisateur/restaurant
```