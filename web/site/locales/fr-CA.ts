export default {
  btn: {
    getStarted: 'Commencer',
    goHome: 'Accueil',
    goBack: 'Retourner',
    downloadSpec: 'Téléchargez la spécification',
    allProducts: 'Voir les produits',
    products: 'Produits',
    dashboard: 'Dashboard',
    sbcConnect: 'Service BC Connect',
    apiDoc: "Documentation de l'API",
    createKey: 'Créer une clé',
    revoke: 'Révoquer',
    copy: 'Copier',
    copied: 'Copié!',
    submit: 'Soumettre',
    next: 'Suivant',
    previous: 'Précédent',
    openMainNav: 'Ouvrir le menu de navigation principal',
    closeMainNav: 'Fermer le menu de navigation principal',
    loginBCSC: 'Connectez-vous avec la carte BC Services', // Connexion avec la carte des services BC ?
    createNewAccount: 'Créer un nouveau compte',
    createAccount: 'Créer un compte',
    useThisAccount: {
      main: 'Utiliser ce Compte',
      aria: 'Utiliser ce Compte, {name}'
    },
    logout: 'se déconnecter'
  },
  currency: {
    cad: 'CAD',
    usd: 'USD'
  },
  labels: {
    note: 'Note',
    optional: 'Optional',
    characters: 'characters',
    buttons: {
      back: 'Back',
      cancel: 'Cancel',
      fileNowNoFee: 'File Now (no fee)',
      reviewConfirm: 'Review and Confirm',
      save: 'Save',
      saveExit: 'Save and Resume Later'
    },
    birthdate: 'Birthdate',
    competency: 'Competency',
    citizenship: 'Citizenship',
    citizenshipPR: 'Citizenship/Permanent Residency',
    emailAddress: 'Email Address',
    fullName: 'Full Legal Name',
    preferredName: 'Preferred Name',
    address: 'Address',
    addressResidential: 'Residential Address',
    state: 'State',
    country: 'Country',
    line1: 'Address Line 1',
    line2: 'Address Line 2 (Optional)',
    city: 'City',
    region: 'Region (Optional)',
    postalCode: 'Postal Code',
    locationDescription: 'Location Description (Optional)',
    countryOfCitizenship: {
      citizen: 'Citizen of Canada',
      pr: 'Permanent resident of Canada',
      others: 'Other citizenship(s)',
      selectAll: 'Select all countries of which this person is a citizen.',
      placeholder: 'Countries of Citizenship',
      findCountry: 'Find a Country',
      select: 'Select',
      selected: 'Selected'
    },
    findACountry: 'Find a country',
    services: {
      bcsc: 'BC Services Card',
      bceid: 'BCeID',
      idir: 'IDIR'
    },
    socialInsuranceNumber: 'Social Insurance Number (SIN)',
    taxNumber: 'Tax Number',
    busName: "Nom de L'entreprise",
    corpNum: 'Numéro de constitution',
    busNum: "Numéro d'entreprise"
  },
  page: {
    notFound: {
      h1: 'Page non trouvée'
    },
    home: {
      title: 'Rapport annuel de Service BC - Accueil',
      h1: 'Déposez votre rapport annuel de la Colombie-Britannique'
    },
    createAccount: {
      title: 'Rapport annuel de Service BC - Création de Compte',
      h1: 'Création de compte Service BC'
    },
    existingAccount: {
      title: 'Rapport annuel de Service BC - Choisissez un Compte Existant',
      h1: 'Compte Existant Trouvé',
      h2: 'Vos Comptes Existants',
      existingAccountWarning: 'Il semble que vous ayez déjà un compte auprès de BC Registries and Online Services. Vous pouvez utiliser un compte existant pour continuer ou en créer un nouveau.'
    }
  },
  SbcHeader: {
    title: 'Service BC Connect',
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
    bcApp: 'Une application en ligne BC'
  },
  SbcLogo: {
    alt: 'Logo du gouvernement de la Colombie-Britannique' // <img> alt
  },
  LocaleSelect: {
    // aria-label
    label: 'Sélectionnez une langue, Français, langue actuelle.'
  },
  SbcProductCard: {
    goTo: 'Aller au'
  },
  SbcDashboardTableApiKeys: {
    title: 'Accès développeur',
    description: {
      main: "L'activation de l'accès des développeurs vous permettrait d'intégrer les services API BC Registries à votre système.",
      sec: 'En savoir plus dans la'
    },
    cols: {
      name: 'Nom',
      env: 'Environnement',
      apiKey: 'Clé API',
      actions: 'Actions'
    }
  },
  modal: {
    createKey: {
      title: 'Créer une clé',
      content: 'Un nom est requis pour créer une nouvelle clé. Veuillez saisir un nom unique ci-dessous.',
      formLabel: 'Nom'
    },
    revokeKey: {
      title: 'Révoquer la clé - {key}',
      content: "Êtes-vous sûr de vouloir révoquer cette clé API? Cela supprimera définitivement l'accès à la clé, les projets en cours utilisant cette clé pourraient être affectés.",
      formLabel: "Entrez '{key}' pour confirmer."
    }
  }
}
