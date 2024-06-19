export default {
  alerts: {
    'future-filing': {
      title: '',
      description: 'The next Annual Report for this company is not due until {date}. Please file the Annual Report on or after that date.'
    },
    'invalid-next-ar-year': {
      title: 'Invalid Annual Report Year',
      description: 'The next Annual Report year is invalid or missing.'
    },
    'missing-token': {
      title: '',
      description: 'Missing token to retrieve business details.'
    },
    'internal-server-error': {
      title: 'Internal Server Error',
      description: 'This service is currently unavailable, please try again later or contact support for assistance.'
    },
    'invalid-token': {
      title: 'Invalid Token',
      description: 'Error retrieving business details with the provided token.'
    },
    'business-details': {
      title: '',
      description: 'Error retrieving business details.'
    },
    'account-access': {
      title: 'Access Denied',
      description: 'Your account does not have permission to complete this task.'
    },
    'payment-error': {
      title: 'Payment Not Complete',
      description: 'Your payment was not completed, please try again.'
    },
    'ar-submit-error': {
      title: 'Submission Error',
      description: 'An error occurred while processing your request. Please confirm your information and try again. If the issue persists, contact support for assistance.'
    },
    'create-account': {
      title: 'Account Creation Error',
      description: 'Please verify your details and try again. If the issue persists, please contact support for assistance.'
    },
    'tos-patch-error': {
      title: 'Terms of Use Error',
      description: 'We could not update the Terms of Use at this time, please try again later or contact us for assistance.'
    },
    'filing-in-progress': {
      title: 'Filing in Progress',
      description: 'Your filing has been paid and is currently being processed.'
    },
    'requires-staff-user': {
      title: 'Staff User Required',
      description: 'This site requires a staff user. Please log in with a staff account.'
    }
  },
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
    loginIDIR: 'Login with IDIR',
    createNewAccount: 'Create New Account',
    createAccount: 'Create Account',
    useThisAccount: {
      main: 'Use this Account',
      aria: 'Use this Account, {name}'
    },
    logout: 'Log out',
    saveAccountAndFileAr: 'Save Account & File Annual Report',
    submitAndPay: 'Submit & Pay',
    accountOptions: 'Account Options Menu',
    accept: 'Accept',
    decline: 'Decline',
    close: 'Close',
    clearFilter: 'Clear Filter: {filter}',
    viewDetails: 'View Details',
    yearAnnualReport: '{year} Annual Report',
    viewRaw: {
      open: 'View Raw',
      close: 'Close Raw'
    }
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
    office: 'Office',
    recipients: 'Recipients',
    sentDate: 'Sent Date',
    actions: 'Actions',
    searchResults: 'Search Results ({count})',
    annualReports: 'Annual Reports ({count})',
    login: 'Log In'
  },
  words: {
    i: 'I',
    addresses: 'Addresses',
    directors: 'Directors',
    confirm: 'Confirm'
  },
  page: {
    notFound: {
      h1: 'Page Not Found'
    },
    home: {
      title: 'Admin Home - Service BC Annual Report',
      h1: 'Service BC Annual Report Admin Dashboard',
      loginHint: 'Log in to access the dashboard.',
      loginImgAlt: 'Generic Login Image'
    },
    admin: {
      title: 'Admin Dashboard - Service BC Annual Report',
      h1: 'Annual Report Invitations',
      table: {
        invite: {
          searchInput: {
            label: 'Search Annual Report Invitations',
            placeholder: 'Search By Business Name, Incorporation Number or Invitation Email',
            help: 'Example: BC012352132'
          },
          emptyText: 'No invitations found',
          inviteError: {
            title: 'Error Fetching Invitations',
            description: 'There was an issue retrieving the Invitations. Please try again later.'
          },
          detailModal: {
            closeBtn: 'Close Business Details',
            noReports: 'No Reports found',
            reportError: {
              title: 'Error Fetching Annual Reports',
              description: 'There was an issue retrieving the Annual Reports. Please try again later.'
            },
            section: {
              reportData: {
                title: 'Report Data',
                arDate: 'Annual Report Date: {value}',
                agmDate: 'AGM Date: {value}',
                voteDate: 'Unanimous Resolution Date: {value}',
                noVote: 'Voted For No AGM: {value}'
              },
              filingData: {
                title: 'Filing Data',
                filingDate: 'Filing Date: {value}',
                filingYear: 'Filing Year: {value}',
                filingStatus: 'Filing Status: {value}',
                payStatus: 'Payment Status: {value}'
              },
              rawData: {
                title: 'Raw Data'
              }
            }
          }
        }
      }
    },
    tos: {
      title: 'Terms of Use - Service BC Annual Report',
      h1: 'Terms of Use',
      form: {
        checkboxLabel: 'I have read and accept the Terms of Use',
        scrollError: 'Please scroll to the bottom of the document to accept the Terms of Use',
        checkedError: 'You must accept the Terms of Use to continue'
      },
      modal: {
        title: 'Decline Terms of Use',
        content: 'By declining the Terms of Use, you will not be able to continue using this service. Please accept the Terms of Use to proceed.'
      }
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
