# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link "FoodDelivery" [ref=e6] [cursor=pointer]:
        - /url: /
        - heading "FoodDelivery" [level=2] [ref=e8]
      - region "accessibility.languageSelector" [ref=e10]:
        - 'button "accessibility.currentLanguage: Français" [ref=e11] [cursor=pointer]':
          - generic [ref=e13]: Français
          - generic [ref=e14]: FR
        - menu [ref=e15]:
          - menuitem "accessibility.switchTo English" [ref=e16] [cursor=pointer]:
            - generic [ref=e18]: English
            - generic [ref=e19]: EN
        - generic [ref=e20]: "accessibility.currentLanguage: Français"
      - list [ref=e21]:
        - listitem [ref=e22]:
          - link "Connexion" [ref=e23] [cursor=pointer]:
            - /url: /login
        - listitem [ref=e24]:
          - link "Inscription" [ref=e25] [cursor=pointer]:
            - /url: /register
  - main [ref=e26]:
    - generic [ref=e27]:
      - heading "Erreur" [level=1] [ref=e28]
      - paragraph [ref=e29]: Restaurant avec l'ID 1 introuvable
      - link "← Retour à la liste des restaurants" [ref=e30] [cursor=pointer]:
        - /url: /utilisateur/restaurant
```