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
      title: 'Erreur de Serveur Interne',
      description: "Ce service est actuellement indisponible, veuillez réessayer plus tard ou contacter l'assistance pour obtenir de l'aide."
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
    },
    'requires-staff-user': {
      title: 'Utilisateur du Personnel Requis',
      description: 'Ce site nécessite un utilisateur du personnel. Veuillez vous connecter avec un compte personnel.'
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
    loginIDIR: 'Connectez-vous avec IDIR', // TODO: review
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
    close: 'Fermer',
    clearFilter: 'Effacer le Filtre: {filter}',
    viewDetails: 'Voir les détails', // TODO: start review
    yearAnnualReport: 'Rapport Annuel {year}',
    viewRaw: {
      open: 'Voir Brut',
      close: 'Fermer Brut'
    } // TODO: end review
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
    office: 'Bureau',
    recipients: 'Destinataires',
    sentDate: 'Date Envoyée',
    actions: 'Actions',
    searchResults: 'Résultats de Recherche ({count})',
    annualReports: 'Rapports Annuels ({count})',
    login: 'Se Connecter'
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
      title: 'Accueil Administrateur - Rapport Annuel de Service CB', // TODO: review home and admin page
      h1: "Tableau de bord d'Administration du Rapport Annuel de Service CB",
      loginHint: 'Connectez-vous pour accéder au tableau de bord.',
      loginImgAlt: 'Image de Connexion Générique'
    },
    admin: {
      title: "Tableau de bord d'Administration - Rapport Annuel de Service CB",
      h1: 'Invitations au Rapport Annuel',
      table: {
        invite: {
          searchInput: {
            label: 'Rechercher des Invitations pour le Rapport Annuel',
            placeholder: "Rechercher par Nom de l'Entreprise, Numéro d'Incorporation ou Courriel d'Invitation",
            help: 'Exemple: BC012352132'
          },
          emptyText: 'Aucune invitation trouvée',
          inviteError: {
            title: 'Erreur Lors de la Récupération des Invitations',
            description: 'Un problème est survenu lors de la récupération des Invitations. Veuillez réessayer plus tard.'
          },
          detailModal: {
            closeBtn: "Fermer Les Détails De L'Entreprise",
            noReports: 'Aucun Rapport Trouvé',
            reportError: {
              title: 'Erreur Lors de la Récupération des Rapports Annuels',
              description: 'Un problème est survenu lors de la récupération des Rapports Annuels. Veuillez réessayer plus tard.'
            },
            section: {
              reportData: {
                title: 'Données du Rapport',
                arDate: 'Date du Rapport Annuel: {value}',
                agmDate: "Date de l'AGA: {value}",
                voteDate: "Date de la Résolution à l'Unanimité: {value}",
                noVote: "Vote pour Pas d'AGA: {value}"
              },
              filingData: {
                title: 'Données de Dépôt',
                filingDate: 'Date de Dépôt: {value}',
                filingYear: 'Année de Dépôt: {value}',
                filingStatus: 'Statut de Dépôt: {value}',
                payStatus: 'Statut de Paiement: {value}'
              },
              rawData: {
                title: 'Données Brutes'
              }
            }
          }
        }
      }
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
