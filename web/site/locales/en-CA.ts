export default {
  btn: {
    getStarted: 'Get Started',
    goHome: 'Go Home',
    goBack: 'Go Back',
    dashboard: 'Dashboard',
    sbcConnect: 'Service BC Connect',
    copy: 'Copy',
    copied: 'Copied!',
    submit: 'Submit',
    next: 'Next',
    previous: 'Previous',
    openMainNav: 'Open Main Navigation Menu',
    closeMainNav: 'Close Main Navigation Menu',
    loginBCSC: 'Login with BC Services Card',
    createNewAccount: 'Create New Account',
    createAccount: 'Create Account',
    useThisAccount: {
      main: 'Use this Account',
      aria: 'Use this Account, {name}'
    },
    logout: 'Log out',
    saveAccountAndFileAr: 'Save Account & File Annual Report',
    submitAndPay: 'Submit & Pay',
    accountOptions: 'Account Options Menu'
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
    busName: 'Business Name',
    corpNum: 'Incorporation Number',
    busNum: 'Business Number',
    arDate: 'Date of Annual Report',
    name: 'Name',
    mailingAddress: 'Mailing Address',
    deliveryAddress: 'Delivery Address',
    effectiveDates: 'Effective Dates',
    apptDate: '{date} to current',
    sameAsMailAddress: 'Same as Mailing Address',
    registeredOffice: 'Registered Office',
    recordsOffice: 'Records Office',
    office: 'Office'
  },
  words: {
    i: 'I'
  },
  page: {
    notFound: {
      h1: 'Page Not Found'
    },
    home: {
      title: 'Home - Service BC Annual Report',
      h1: 'File your BC Annual Report'
    },
    createAccount: {
      title: 'Account Creation - Service BC Annual Report',
      h1: 'Service BC Account Creation',
      h2: 'Account Details',
      form: {
        infoSection: {
          fieldSet: 'Your Name',
          info: 'This is your legal name as it appears on your BC Services Card.'
        },
        accountNameSection: {
          fieldSet: 'Account Name',
          accountNameInputLabel: 'Account Name',
          error: {
            req: 'Please enter an Account Name',
            min: 'Account Name must be at least 2 characters',
            unique: 'Account Name must be unique'
          }
        },
        contactDetailsSection: {
          fieldSet: 'Contact Details',
          phoneInputLabel: 'Phone Number',
          phoneExtInputLabel: {
            main: 'Extension (Optional)',
            aria: 'Phone Number Extension, Optional'
          },
          emailInputLabel: 'Email Address',
          error: {
            phone: {
              req: 'Please enter a Phone Number',
              invalid: 'Please enter a valid phone number'
            },
            phoneExt: 'Please enter a valid extension',
            email: {
              req: 'Please enter an Email Address',
              invalid: 'Please enter a valid email address'
            }
          }
        }
      }
    },
    existingAccount: {
      title: 'Choose Existing Account - Service BC Annual Report',
      h1: 'Existing Account Found',
      h2: 'Your Existing Accounts',
      existingAccountWarning: 'It looks like you already have an account with Service BC Connect. You can use an existing account to proceed or create a new one.'
    },
    missingId: {
      title: 'Authorization Required - Service BC Annual Report',
      h1: 'Authorization Required'
    },
    annualReport: {
      title: 'File Your BC Annual Report - Service BC Annual Report',
      h1: '{year} Annual Report',
      h2: 'Annual Report for: {name}',
      reviewAndConfirm: 'Please review the Office Addresses and Current Directors below.',
      form: {
        heldAgm: {
          question: 'Has your company held an Annual General Meeting?',
          opt1: 'Yes',
          opt2: 'We have not held an AGM yet',
          opt3: 'We voted to not hold an AGM'
        },
        agmDate: {
          placeholder: 'Select Annual General Meeting Date',
          label: 'Select Annual General Meeting Date',
          format: 'Format: YYYY-MM-DD',
          error: 'You must select a date if you held an AGM'
        },
        certify: {
          question: 'certify all information about the Office Addresses and Current Directors is correct.',
          error: 'You must confirm to continue'
        }
      },
      payError: {
        title: 'Payment Not Complete',
        description: 'Your payment was not completed, please try again.'
      }
    },
    submitted: {
      title: 'Annual Report Complete - Service BC Annual Report',
      h1: 'Annual Report Complete'
    }
  },
  widgets: {
    feeSummary: {
      title: 'Fee Summary',
      total: 'Total Fees',
      noFee: 'No Fee',
      priorityFees: 'Priority Fees',
      futureEffectiveFees: 'Future Effective Fees',
      serviceFees: 'Service Fees',
      itemLabels: {
        TEST: 'This is test entry',
        REGSIGIN: 'Significant Individual Change',
        BCANN: 'BC Annual Report'
      }
    }
  },
  SbcHeader: {
    title: 'Service BC Connect',
    logoBtnLabel: 'Home', // <img> link aria-label
    navLabel: 'Main Navigation' // <nav> aria-label
  },
  SbcFooter: {
    navLabel: 'Useful Links', // <nav> aria-label
    home: 'Home',
    disclaimer: 'Disclaimer',
    privacy: 'Privacy',
    ally: 'Accessibility',
    copyright: 'Copyright',
    bcApp: 'A BC Online Application'
  },
  SbcLogo: {
    alt: 'Government of British Columbia Logo' // <img> alt
  },
  LocaleSelect: {
    // aria-label
    label: 'Select a Language, current language: English'
  }
}
