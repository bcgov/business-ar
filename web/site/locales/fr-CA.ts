export default {
  alerts: { // TODO: review alert messages
    'future-filing': {
      title: '',
      description: "Le prochain Rapport Annuel de cette entreprise n'est pas dû avant le {date}. Veuillez déposer le Rapport Annuel à partir de cette date."
    },
    'invalid-next-ar-year': {
      title: 'Année de Rapport Annuel invalide',
      description: "L'année suivante du Rapport Annuel est invalide ou manquante."
    },
    'missing-token': {
      title: '',
      description: "Jeton manquant pour récupérer les détails de l'entreprise."
    },
    'internal-server-error': {
      title: '',
      description: "Erreur de serveur interne, veuillez réessayer plus tard ou contactez-nous pour obtenir de l'aide."
    },
    'invalid-token': {
      title: 'Jeton Invalide',
      description: "Erreur lors de la récupération des détails de l'entreprise avec le jeton fourni."
    },
    'business-details': {
      title: '',
      description: "Erreur lors de la récupération des détails de l'entreprise."
    },
    'account-access': {
      title: 'Accès Refusé',
      description: "Votre compte n'est pas autorisé à effectuer cette tâche."
    },
    'payment-error': {
      title: 'Paiement Incomplet',
      description: "Votre paiement n'a pas été finalisé, veuillez réessayer."
    },
    'ar-submit-error': {
      title: 'Erreur de Soumission',
      description: "Une erreur s'est produite lors du traitement de votre demande. Veuillez confirmer vos informations et réessayer. Si le problème persiste, contactez le support pour obtenir de l'aide."
    },
    'create-account': {
      title: 'Erreur de Création de Compte',
      description: "Veuillez vérifier vos coordonnées et réessayer. Si le problème persiste, veuillez contacter le support pour obtenir de l'aide."
    },
    'tos-patch-error': {
      title: "Erreur des Conditions d'Utilisation",
      description: "Nous n'avons pas pu mettre à jour les Conditions d'Utilisation pour le moment. Veuillez réessayer plus tard ou nous contacter pour obtenir de l'aide."
    },
    'filing-in-progress': {
      title: 'Soumission en Cours',
      description: 'Votre soumission a été payée et est actuellement en cours de traitement.'
    }
  },
  btn: {
    getStarted: 'Commencer',
    goHome: 'Accueil',
    goBack: 'Retourner',
    dashboard: 'Dashboard',
    sbcConnect: 'Service Connect CB',
    copy: 'Copier',
    copied: 'Copié!',
    submit: 'Soumettre',
    next: 'Suivant',
    previous: 'Précédent',
    openMainNav: 'Ouvrir le menu de Navigation Principal',
    closeMainNav: 'Fermer le menu de Navigation Principal',
    loginBCSC: 'Connectez-vous avec la Carte Service CB',
    createNewAccount: 'Créer un Nouveau Compte',
    createAccount: 'Créer un Compte',
    useThisAccount: {
      main: 'Utiliser ce Compte',
      aria: 'Utiliser le Compte, {name}'
    },
    logout: 'Se Déconnecter',
    saveAccountAndFileAr: 'Enregistrer le Compte et Déposer le Rapport Annuel',
    submitAndPay: 'Soumettre et Payer',
    accountOptions: "Menu d'options pour Compte",
    accept: 'Accepter',
    decline: 'Déclin',
    close: 'Fermer'
  },
  currency: {
    cad: 'CAD',
    usd: 'USD'
  },
  labels: {
    note: 'Note',
    optional: 'Optionnel',
    characters: 'caractères',
    buttons: {
      back: 'Précédent',
      cancel: 'Annuler',
      fileNowNoFee: 'Déposer maintenant (sans frais)',
      reviewConfirm: 'Réviser et Confirmer',
      save: 'Sauvegarder',
      saveExit: 'Sauvegarder et Reprendre Plus Tard'
    },
    birthdate: 'Date de Naissance',
    competency: 'Compétence',
    citizenship: 'Citoyenneté',
    citizenshipPR: 'Citoyenneté/Résidence Permanente',
    emailAddress: 'Adresse e-mail',
    fullName: 'Nom Légal Complet',
    preferredName: 'Nom Préféré',
    address: 'Adresse',
    addressResidential: 'Adresse Résidentielle',
    state: 'État',
    country: 'Pays',
    line1: "Ligne d'adresse 1",
    line2: "Ligne d'adresse 2 (Facultatif)",
    city: 'Ville',
    region: 'Région (Facultatif)',
    postalCode: 'Code Postal',
    locationDescription: 'Description du Lieu (Facultatif)',
    countryOfCitizenship: {
      citizen: 'Citoyen du Canada',
      pr: 'Résident Permanent du Canada',
      others: 'Autre(s) Nationalité(s)',
      selectAll: 'Sélectionnez tous les pays dont cette personne est citoyenne.',
      placeholder: 'Pays de Citoyenneté',
      findCountry: 'Trouver un Pays',
      select: 'Sélectionner',
      selected: 'Sélectionné'
    },
    findACountry: 'Trouver un Pays',
    services: {
      bcsc: 'la Carte Service CB',
      bceid: 'BCeID',
      idir: 'IDIR'
    },
    socialInsuranceNumber: "Numéro d'assurance sociale",
    taxNumber: "Numéro d'impot",
    busName: "Nom de l'entreprise",
    corpNum: 'Numéro de constitution',
    busNum: "Numéro d'entreprise",
    arDate: 'Date du Rapport Annuel',
    name: 'Nom', // TODO: start review
    mailingAddress: 'Adresse Postale',
    deliveryAddress: 'Adresse de Livraison',
    effectiveDates: "Dates d'Effet",
    apptDate: '{date} à actuel',
    sameAsMailAddress: "Identique à l'Adresse Postale",
    registeredOffice: 'Siège Social',
    recordsOffice: 'Bureau des Archives',
    office: 'Bureau'
  },
  words: {
    i: 'Je',
    addresses: 'Adresses',
    directors: 'Directeurs',
    confirm: 'Confirmer' // TODO: end review
  },
  page: {
    notFound: {
      h1: 'Page introuvable'
    },
    home: {
      title: 'Accueil - Rapport Annuel de Service CB',
      h1: 'Déposez votre rapport annuel de la Colombie-Britannique'
    },
    createAccount: {
      title: 'Création de Compte - Rapport Annuel de Service CB',
      h1: 'Création de Compte Service CB',
      h2: 'Détails du Compte',
      form: {
        infoSection: {
          fieldSet: 'Votre Nom',
          info: "Ceci est votre nom légal qu'il apparaît sur votre carte Services CB."
        },
        accountNameSection: {
          fieldSet: 'Nom du Compte',
          accountNameInputLabel: 'Nom du Compte',
          error: {
            req: 'Veuillez entrer un nom de compte',
            min: 'Le nom du compte doit comporter au moins 2 caractères',
            unique: 'Le nom du compte doit être unique'
          }
        },
        contactDetailsSection: {
          fieldSet: 'Détails du Contact',
          phoneInputLabel: 'Numéro de téléphone',
          phoneExtInputLabel: {
            main: 'Extension (Facultatif)',
            aria: 'Extension du numéro de téléphone, Optionionnel'
          },
          emailInputLabel: 'Adresse e-mail',
          error: {
            phone: {
              req: 'Veuillez entrer un numéro de téléphone',
              invalid: 'Veuillez entrer un numéro de téléphone valide'
            },
            phoneExt: 'Veuillez entrer une extension valide', // TODO: review
            email: {
              req: "Veuillez entrer une adresse email s'il vous plaît",
              invalid: 'Veuillez entrer une adresse email valide'
            }
          }
        }
      }
    },
    existingAccount: {
      title: 'Choisissez un Compte Existant - Rapport Annuel de Service CB',
      h1: 'Compte Existant Trouvé',
      h2: 'Vos Comptes Existants',
      existingAccountWarning: 'Il semble que vous ayez déjà un compte avec Service Connect CB. Vous pouvez utiliser un compte existant pour continuer ou en créer un nouveau.'
    },
    missingId: {
      title: 'Autorisation Requise - Rapport Annuel de Service CB',
      h1: 'Autorisation Nécessaire'
    },
    annualReport: {
      title: 'Déposez votre rapport annuel - Rapport Annuel de Service CB',
      h1: 'Rapport Annuel {year}',
      h2: 'Rapport Annuel pour: {name}',
      reviewAndConfirm: 'Veuillez confirmer les adresses des bureaux et les administrateurs actuels ci-dessous.',
      form: { // TODO: review annual report form translations
        agmStatus: {
          question: "Le statut de l'Assemblée Générale Annuelle (AGA) {year} de cette entreprise",
          tooltip: "La collecte d'informations sur l'AGA nous aide à mieux calculer les dates de prolongation de l'AGA et les changements de lieu. Cela permet également de garantir que votre entreprise reste conforme et en règle.",
          opt1: 'Notre AGA {year} a eu lieu',
          opt2: 'Notre AGA {year} aura lieu',
          opt3: "Le conseil d'administration a voté contre la tenue de notre AGA {year}",
          error: "Veuillez sélectionner un statut d'AGA pour continuer"
        },
        agmDate: {
          placeholder: "Date de l'AGA",
          label: "Date de l'AGA",
          format: 'Format: AAAA-MM-JJ',
          error: 'Vous devez sélectionner une date si vous avez tenu une AGA'
        },
        voteDate: {
          placeholder: 'Date de Résolution Unanime',
          label: 'Date de Résolution Unanime',
          format: 'Format: AAAA-MM-JJ',
          error: "Vous devez sélectionner une date de résolution si le conseil d'administration a voté pour ne pas tenir d'AGA."
        },
        complianceWarning: "{boldStart}Important:{boldEnd} Veuillez vous assurer que vous respectez les exigences de l'AGA avant de déposer votre rapport annuel.",
        certify: {
          question: 'certifie que toutes les informations concernant les adresses des bureaux et les directeurs actuels sont exactes.',
          error: 'Vous devez confirmer pour continuer'
        }
      },
      noAddresses: 'Aucune adresse trouvée',
      noDirectors: 'Aucun réalisateur trouvé'
    },
    submitted: {
      title: 'Rapport Annuel Terminé - Rapport Annuel de Service CB',
      h1: 'Rapport Annuel Terminé'
    },
    tos: { // TODO: review tos page translations
      title: "Conditions d'Utilisation - Rapport Annuel de Service CB",
      h1: "Conditions d'Utilisation",
      form: {
        checkboxLabel: "J'ai lu et j'accepte les Conditions d'Utilisation",
        scrollError: "Veuillez faire défiler jusqu'en bas du document pour accepter les Conditions d'Utilisation",
        checkedError: "Vous devez accepter les Conditions d'Utilisation pour continuer"
      },
      modal: {
        title: "Refuser les Conditions d'Utilisation",
        content: "En refusant les Conditions d'Utilisation, vous ne pourrez pas continuer à utiliser ce service. Veuillez accepter les Conditions d'Utilisation pour continuer."
      }
    }
  },
  widgets: {
    feeSummary: {
      title: 'Résumé des Frais',
      total: 'Total des Frais',
      noFee: 'Pas de frais',
      priorityFees: 'Frais prioritaires',
      futureEffectiveFees: 'Frais effectifs futurs',
      serviceFees: 'Frais de Service',
      itemLabels: {
        TEST: 'This is test entry',
        REGSIGIN: 'Significant Individual Change',
        BCANN: 'Rapport Annuel CB'
      }
    }
  },
  SbcHeader: {
    title: 'Service Connect CB',
    logoBtnLabel: 'Accueil', // <img> link aria-label
    navLabel: 'Navigation principale' // <nav> aria-label
  },
  SbcFooter: {
    navLabel: 'Liens utiles', // <nav> aria-label
    home: 'Accueil',
    disclaimer: 'Clause de non-responsabilité',
    privacy: 'Confidentialité',
    ally: 'Accessibilité',
    copyright: "Droits d'auteur",
    bcApp: 'Une application en ligne CB'
  },
  SbcLogo: {
    alt: 'Logo du gouvernement de la Colombie-Britannique' // <img> alt
  },
  LocaleSelect: {
    // aria-label
    label: 'Sélectionnez une langue, langue courante: Français'
  }
}
