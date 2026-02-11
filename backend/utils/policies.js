const POLICY_VERSION = '2026-02-11';

const policies = {
  version: POLICY_VERSION,
  terms: {
    title: 'LinkUp Terms and Agreement',
    sections: [
      {
        title: 'Escrow Policy',
        body: 'Money paid by the client is held in escrow and is only released after client confirmation that the job is completed.'
      },
      {
        title: 'Verification Policy',
        body: 'Artisans must provide a valid Ghana Card number and supporting Ghana Card image before verification approval.'
      },
      {
        title: 'Conduct Policy',
        body: 'Off-platform payments are prohibited. Users must complete payments within LinkUp to protect trust, records, and commission handling.'
      },
      {
        title: 'Dispute Policy',
        body: 'Disputes are reviewed by LinkUp Admin. Admin may release funds to artisan, refund client, or hold funds after evidence review.'
      }
    ]
  },
  privacy: {
    title: 'LinkUp Privacy Policy',
    sections: [
      {
        title: 'Data Collected',
        body: 'We collect account details, profile information, payment references, job history, and uploaded verification documents.'
      },
      {
        title: 'Data Use',
        body: 'We use this data to provide marketplace matching, verification checks, dispute resolution, analytics, and legal compliance.'
      },
      {
        title: 'Data Protection',
        body: 'Sensitive data is protected with access controls. Only authorized staff can review identity documents and disputes.'
      }
    ]
  }
};

module.exports = { POLICY_VERSION, policies };

